const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const brianService = require('../services/brianService');
const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();
const asyncHandler = require('../utils/asyncHandler');

// Attempt to load agent_virtuals.json
let agentVirtuals = {};
try {
  const filePath = path.join(__dirname, '../config', 'agent_virtuals.json');
  agentVirtuals = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log('[chatController] Loaded agent_virtuals.json successfully.');
} catch (err) {
  console.error('[chatController] Error reading agent_virtuals.json:', err);
  // fallback so we don't crash
  agentVirtuals.description = 'You are a friendly coinbeats character.';
}

// Initialize OpenAI Client
const openaiClient = new OpenAI({
  apiKey: process.env.GALADRIEL_API_KEY,
  baseURL: 'https://api.galadriel.com/v1/verified',
});

/**
 * Classify the user's prompt into one of three categories:
 * - "twitter"    → for Twitter-related queries
 * - "blockchain" → for on-chain/crypto questions
 * - "chat"       → for general conversation.
 */
async function classifyPrompt(prompt) {
  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            "You are an assistant that classifies user prompts into exactly one of the following categories: 'twitter', 'blockchain', or 'chat'. Return only one word.",
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0,
      max_tokens: 10,
    });

    const classification = response.choices[0].message.content
      .trim()
      .toLowerCase();

    if (['twitter', 'blockchain', 'chat'].includes(classification)) {
      return classification;
    }
    return 'chat'; // Default
  } catch (error) {
    console.error('Error classifying prompt:', error);
    return 'chat'; // Fallback if classification fails
  }
}

async function generateChatTitle(prompt) {
  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are an assistant that generates chat title for user prompts. Title must be in range from 2 to 5 words. Return only the title.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0,
      max_tokens: 10,
    });

    let content = response.choices[0].message.content;
    if (content?.length > 2) content = content.slice(1, -1);

    console.log('Generated chat title:', content);

    return content || prompt.slice(0, 26);
  } catch (error) {
    console.error('Error generating chat title:', error);
    return prompt.slice(0, 26);
  }
}

/**
 * Handles the chat request:
 *  - If classified as "twitter", retrieve Twitter data from Brian.
 *  - If classified as "blockchain", try Brian’s agent.
 *    -> if Brian fails, fallback to OpenAI with our Coinbeats persona
 *  - Else, use OpenAI ChatGPT with our Coinbeats persona.
 */
exports.handleChat = async (req, res) => {
  try {
    const { prompt, address, chainId, messages = [] } = req.body;

    // console.log('[chatController] Received chat request:', req.body);

    if (!prompt || !address) {
      return res.status(400).json({ error: 'Prompt and address required' });
    }

    const taskType = await classifyPrompt(prompt);
    console.log(`[chatController] Classified prompt as: ${taskType}`);

    if (taskType === 'twitter') {
      // Twitter-related request: for example, get trends
      const twitterData = await brianService.getTwitterTrends();
      return res.status(200).json({ result: twitterData });
    }

    if (taskType === 'blockchain') {
      // On-chain crypto/transaction question: use Brian's on-chain agent
      const brianResponse = await brianService.interactWithAgent({
        prompt,
        address,
        chainId,
        messages,
      });

      // If Brian can't answer, fallback to OpenAI with Coinbeats system prompt
      if (brianResponse.error) {
        console.log('[chatController] Brian failed, switching to OpenAI...');
        const fallbackResponse = await openaiClient.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content:
                agentVirtuals.description || 'A friendly coinbeats agent.',
            },
            { role: 'user', content: prompt },
          ],
        });
        return res.status(200).json({
          result: { answer: fallbackResponse.choices[0].message.content },
        });
      }

      return res.status(200).json({ result: brianResponse });
    }

    // Otherwise, general chat: answer directly using OpenAI with Coinbeats persona
    const chatResponse = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            agentVirtuals.description || 'A friendly Coinbeats AI agent.',
        },
        { role: 'user', content: prompt },
      ],
    });

    return res.status(200).json({
      result: { answer: chatResponse.choices[0].message.content },
    });
  } catch (error) {
    console.error('Error in handleChat:', error);
    return res
      .status(500)
      .json({ error: error.message || 'Internal server error' });
  }
};

exports.getAllChats = asyncHandler(async (req, res, next) => {
  const { keyword, limit = 20, offset = 0 } = req.query;

  const where = { is_deleted: false, user_id: req.user?.id };
  if (keyword) {
    where.title = { contains: keyword, mode: 'insensitive' };
  }

  let chats = await prisma.aiChats.findMany({
    where,
    select: { id: true, title: true },
    orderBy: { id: 'desc' },
    take: +limit,
    skip: +offset,
  });

  res.status(200).json(chats);
});

exports.createChat = asyncHandler(async (req, res, next) => {
  let { title, prompt } = req.body;
  if (!title) title = await generateChatTitle(prompt);

  const newChat = await prisma.aiChats.create({
    data: { title, user_id: req.user?.id },
    select: { id: true, title: true },
  });

  res.status(201).send(newChat);
});

exports.updateChat = async (req, res, next) => {
  try {
    const telegramUserId = +req.headers['x-telegram-user-id'];
    if (!telegramUserId)
      return next(createError(400, 'Telegram User ID is required'));

    const user = await prisma.user.findUnique({
      where: { telegramUserId },
      select: { id: true },
    });
    if (!user) return next(createError(404, 'User not found'));

    const { id } = req.params;
    const { title } = req.body;

    await prisma.aiChats.update({
      where: { id: +id, user_id: user?.id },
      data: { title },
    });

    res.status(200).send();
  } catch (error) {
    console.error('Error updating chat:', error);
    next(createError(500, 'Error updating chat'));
  }
};

exports.deleteChat = async (req, res, next) => {
  try {
    const telegramUserId = +req.headers['x-telegram-user-id'];
    if (!telegramUserId)
      return next(createError(400, 'Telegram User ID is required'));

    const user = await prisma.user.findUnique({
      where: { telegramUserId },
      select: { id: true },
    });
    if (!user) return next(createError(404, 'User not found'));

    const { id } = req.params;

    await prisma.aiChats.update({
      where: { id: +id, user_id: user?.id },
      data: { is_deleted: true },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting chat:', error);
    next(createError(500, 'Error deleting chat'));
  }
};
