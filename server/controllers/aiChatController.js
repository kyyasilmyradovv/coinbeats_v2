const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const brianService = require('../services/brianService');

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
  apiKey: process.env.OPENAI_API_KEY,
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

/**
 * Handles the chat request:
 *  - If classified as "twitter", retrieve Twitter data from Brian.
 *  - If classified as "blockchain", try Brian’s agent.
 *    -> if Brian fails, fallback to OpenAI with our Barista persona
 *  - Else, use OpenAI ChatGPT with our Barista persona.
 */
exports.handleChat = async (req, res) => {
  try {
    const { prompt, address, chainId, messages = [] } = req.body;

    console.log('[chatController] Received chat request:', req.body);

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

      // If Brian can't answer, fallback to OpenAI with Barista system prompt
      if (brianResponse.error) {
        console.log('[chatController] Brian failed, switching to OpenAI...');
        const fallbackResponse = await openaiClient.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              // Insert Barista persona text from agent_virtuals
              content: agentVirtuals.description || 'A friendly barista agent.',
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

    // Otherwise, general chat: answer directly using OpenAI with Barista persona
    const chatResponse = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: agentVirtuals.description || 'A friendly barista agent.',
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
