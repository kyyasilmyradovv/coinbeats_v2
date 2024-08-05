// server/server.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // Import multer for file handling

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 7000;

const SALT_ROUNDS = 10;
const JWT_SECRET = 'your_jwt_secret';

app.use(cors());

// Create storage engine for multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.json({ limit: '10mb' })); // Increase the JSON body size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Increase URL-encoded body size limit

// Middleware to authenticate and authorize users
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
}

// Route to get all users
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

app.delete('/users/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    await prisma.user.delete({
      where: { id: parseInt(userId, 10) },
    });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error deleting user' });
  }
});

app.get('/inbox', async (req, res) => {
  try {
    const messages = await prisma.inboxMessage.findMany();
    res.json(messages);
  } catch (error) {
    console.error('Error fetching inbox messages:', error);
    res.status(500).json({ error: 'Error fetching inbox messages' });
  }
});

app.post('/inbox/:id/approve', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.inboxMessage.update({
      where: { id: parseInt(id, 10) },
      data: { status: 'approved' },
    });
    res.status(200).json({ message: 'Message approved' });
  } catch (error) {
    console.error('Error approving message:', error);
    res.status(500).json({ error: 'Error approving message' });
  }
});

app.post('/inbox/:id/reject', async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  try {
    await prisma.inboxMessage.update({
      where: { id: parseInt(id, 10) },
      data: { status: 'rejected', rejectReason: reason },
    });
    res.status(200).json({ message: 'Message rejected' });
  } catch (error) {
    console.error('Error rejecting message:', error);
    res.status(500).json({ error: 'Error rejecting message' });
  }
});

app.get('/api/users/:telegramUserId', async (req, res) => {
  try {
    const telegramUserId = parseInt(req.params.telegramUserId, 10);
    const user = await prisma.user.findUnique({
      where: { telegramUserId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Error fetching user' });
  }
});

// Example login function
async function login(email, password) {
  try {
    const response = await axios.post('http://localhost:7000/login', { email, password });
    const { user, token } = response.data;

    if (token) {
      localStorage.setItem('authToken', token); // Store in localStorage
      useUserStore.getState().loginUser({ ...user, token }); // Store in Zustand
    } else {
      console.error('No token received');
    }
  } catch (error) {
    console.error('Login error:', error);
  }
}


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

app.post('/api/register-creator', async (req, res) => {
  try {
    const { telegramUserId, name, email, password } = req.body;

    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { telegramUserId } });

    if (user) {
      // Update role if necessary
      if (user.role !== 'CREATOR') {
        user = await prisma.user.update({
          where: { telegramUserId },
          data: { role: 'CREATOR' },
        });
        return res.status(200).json({ message: 'User role updated to CREATOR', user });
      } else {
        return res.status(200).json({ message: 'User already has the CREATOR role' });
      }
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Create the user with the CREATOR role
      user = await prisma.user.create({
        data: {
          telegramUserId,
          name,
          email,
          password: hashedPassword,
          role: 'CREATOR',
        },
      });

      res.status(201).json({ message: 'User registered as a CREATOR', userId: user.id });
    }
  } catch (error) {
    console.error('Error registering creator:', error);
    res.status(500).json({ error: 'Error registering creator' });
  }
});

app.post('/api/update-role', async (req, res) => {
  try {
    const { userId, newRole } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Error updating role' });
  }
});

app.post('/api/log-session', async (req, res) => {
  try {
    const { telegramUserId, sessionStart, sessionEnd, routeDurations } = req.body;
    const duration = Math.floor((new Date(sessionEnd) - new Date(sessionStart)) / 1000);

    // Find user by telegramUserId if exists
    const user = await prisma.user.findUnique({
      where: { telegramUserId },
    });

    // Create session log without requiring a user
    await prisma.sessionLog.create({
      data: {
        userId: user ? user.id : null,
        telegramUserId,
        sessionStart: new Date(sessionStart),
        sessionEnd: new Date(sessionEnd),
        duration,
        routeDurations: JSON.stringify(routeDurations),
      },
    });

    res.status(201).json({ message: 'Session logged successfully' });
  } catch (error) {
    console.error('Error logging session:', error);
    res.status(500).json({ error: 'Error logging session' });
  }
});

app.post('/api/user-interaction', async (req, res) => {
  try {
    const { telegramUserId, action, name, email, password } = req.body;

    // Check if the user already exists
    let user = await prisma.user.findUnique({ where: { telegramUserId } });

    if (!user && (action === 'register_creator' || action === 'significant_action')) {
      // Create a user if a significant action is performed
      user = await prisma.user.create({
        data: {
          telegramUserId,
          name: name || 'Unknown',
          email: email || '',
          password: password ? bcrypt.hashSync(password, SALT_ROUNDS) : null,
          role: action === 'register_creator' ? 'CREATOR' : 'USER',
        },
      });

      // Update existing session logs with the new userId
      await prisma.sessionLog.updateMany({
        where: { telegramUserId },
        data: { userId: user.id },
      });
    }

    // Additional logic for specific actions...
    switch (action) {
      case 'bookmark':
        // Handle bookmarking logic
        break;
      case 'collect_points':
        // Handle point collection logic
        break;
      case 'social_quest':
        // Handle social quest logic
        break;
      default:
        break;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error handling user interaction:', error);
    res.status(500).json({ error: 'Error handling user interaction' });
  }
});

app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await prisma.sessionLog.findMany();
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching session logs:', error);
    res.status(500).json({ error: 'Error fetching session logs' });
  }
});

// Categories
app.post('/api/categories', async (req, res) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.create({
      data: {
        name,
      },
    });
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Error creating category' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
      },
    });
    res.json({ message: 'Category updated successfully', category: updatedCategory });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Error updating category' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.category.delete({
      where: { id: parseInt(id, 10) },
    });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Error deleting category' });
  }
});

// Chains
app.post('/api/chains', async (req, res) => {
  try {
    const { name } = req.body;
    const chain = await prisma.chain.create({
      data: {
        name,
      },
    });
    res.status(201).json({ message: 'Chain created successfully', chain });
  } catch (error) {
    console.error('Error creating chain:', error);
    res.status(500).json({ error: 'Error creating chain' });
  }
});

app.get('/api/chains', async (req, res) => {
  try {
    const chains = await prisma.chain.findMany();
    res.json(chains);
  } catch (error) {
    console.error('Error fetching chains:', error);
    res.status(500).json({ error: 'Error fetching chains' });
  }
});

app.put('/api/chains/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const updatedChain = await prisma.chain.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
      },
    });
    res.json({ message: 'Chain updated successfully', chain: updatedChain });
  } catch (error) {
    console.error('Error updating chain:', error);
    res.status(500).json({ error: 'Error updating chain' });
  }
});

app.delete('/api/chains/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.chain.delete({
      where: { id: parseInt(id, 10) },
    });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting chain:', error);
    res.status(500).json({ error: 'Error deleting chain' });
  }
});

app.get('/api/initial-questions', async (req, res) => {
  try {
    const initialQuestions = await prisma.initialQuestion.findMany({
      include: {
        AcademyQuestion: true, // Correct relation inclusion
      },
    });

    console.log('Fetched Initial Questions:', initialQuestions); // Debugging output
    res.json(initialQuestions);
  } catch (error) {
    console.error('Error fetching initial questions:', error);
    res.status(500).json({ error: 'Error fetching initial questions' });
  }
});

app.post('/api/initial-questions', authenticateToken, authorizeRoles('SUPERADMIN'), async (req, res) => {
  try {
    const { text } = req.body;
    const question = await prisma.initialQuestion.create({
      data: {
        text,
      },
    });
    res.status(201).json({ message: 'Initial question created successfully', question });
  } catch (error) {
    console.error('Error creating initial question:', error);
    res.status(500).json({ error: 'Error creating initial question' });
  }
});

app.put('/api/initial-questions/:id', authenticateToken, authorizeRoles('SUPERADMIN'), async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  try {
    const updatedQuestion = await prisma.initialQuestion.update({
      where: { id: parseInt(id, 10) },
      data: {
        text,
      },
    });
    res.json({ message: 'Initial question updated successfully', question: updatedQuestion });
  } catch (error) {
    console.error('Error updating initial question:', error);
    res.status(500).json({ error: 'Error updating initial question' });
  }
});

app.delete('/api/initial-questions/:id', authenticateToken, authorizeRoles('SUPERADMIN'), async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.initialQuestion.delete({
      where: { id: parseInt(id, 10) },
    });
    res.status(204).json({ message: 'Initial question deleted successfully' });
  } catch (error) {
    console.error('Error deleting initial question:', error);
    res.status(500).json({ error: 'Error deleting initial question' });
  }
});

// Academy Creation
app.post(
  '/api/academies',
  authenticateToken,
  upload.fields([{ name: 'logo' }, { name: 'coverPhoto' }]),
  async (req, res) => {
    try {
      const {
        name,
        ticker,
        categories,
        chains,
        twitter,
        telegram,
        discord,
        coingecko,
        initialAnswers,
        tokenomics,
        teamBackground,
        congratsVideo,
        getStarted,
        raffles,
        quests,
        webpageUrl,
      } = req.body;
      const { userId } = req.user;
      
      // Safely handle file uploads
      const files = req.files || {};

      // Use uploaded files' data if provided
      const logoFile = files['logo'] ? files['logo'][0] : null;
      const coverPhotoFile = files['coverPhoto'] ? files['coverPhoto'][0] : null;

      const logoUrl = logoFile ? `data:${logoFile.mimetype};base64,${logoFile.buffer.toString('base64')}` : null;
      const coverPhotoUrl = coverPhotoFile ? `data:${coverPhotoFile.mimetype};base64,${coverPhotoFile.buffer.toString('base64')}` : null;

      // Parse JSON arrays
      const parsedCategories = JSON.parse(categories);
      const parsedChains = JSON.parse(chains);
      const parsedInitialAnswers = JSON.parse(initialAnswers);
      const parsedRaffles = JSON.parse(raffles);
      const parsedQuests = JSON.parse(quests);

      // Create an academy and associate initial questions and their answers
      const academy = await prisma.academy.create({
        data: {
          name,
          ticker,
          categories: { connect: parsedCategories.map(category => ({ name: category })) },
          chains: { connect: parsedChains.map(chain => ({ name: chain })) },
          twitter,
          telegram,
          discord,
          coingecko,
          academyQuestions: {
            create: parsedInitialAnswers.map((initialAnswer) => ({
              initialQuestionId: initialAnswer.initialQuestionId,
              answer: initialAnswer.answer,
              quizQuestion: initialAnswer.quizQuestion,
              choices: {
                create: initialAnswer.choices.map((choice) => ({
                  text: choice.answer,
                  isCorrect: choice.correct,
                })),
              },
            })),
          },
          tokenomics,
          teamBackground,
          congratsVideo,
          getStarted,
          raffles: {
            create: parsedRaffles.map((raffle) => ({
              amount: parseInt(raffle.amount, 10),
              reward: raffle.reward,
              currency: raffle.currency,
              chain: raffle.chain,
              dates: raffle.dates,
              totalPool: parseInt(raffle.totalPool, 10),
            })),
          },
          quests: {
            create: parsedQuests.map((quest) => ({
              name: quest.name,
              link: quest.link,
              platform: quest.platform,
            })),
          },
          logoUrl,
          coverPhotoUrl,
          webpageUrl,
          status: 'pending',
          creatorId: userId,
        },
      });

      res.status(201).json({ message: 'Academy created successfully', academy });
    } catch (error) {
      console.error('Error creating academy:', error);
      res.status(500).json({ error: 'Error creating academy' });
    }
  }
);

// List Academies for Current User
app.get('/api/my-academies', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const academies = await prisma.academy.findMany({
      where: { creatorId: userId },
    });

    res.json(academies);
  } catch (error) {
    console.error('Error fetching academies:', error);
    res.status(500).json({ error: 'Error fetching academies' });
  }
});

// Get Academy Details
app.get('/api/academy/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const academy = await prisma.academy.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        categories: true,
        chains: true,
        academyQuestions: {
          include: {
            choices: true,
            initialQuestion: true, // Include initial question and its answer
          },
        },
        raffles: true,
        quests: true,
      },
    });

    if (!academy) {
      return res.status(404).json({ error: 'Academy not found' });
    }

    res.json(academy);
  } catch (error) {
    console.error('Error fetching academy details:', error);
    res.status(500).json({ error: 'Error fetching academy details' });
  }
});

// Update Academy
app.put('/api/academy/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, ticker, categories, chains, twitter, telegram, discord, coingecko, initialAnswers, quizQuestions, tokenomics, teamBackground, congratsVideo, getStarted, raffles, quests, logoUrl, coverPhotoUrl, webpageUrl } = req.body;

  try {
    const updatedAcademy = await prisma.academy.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
        ticker,
        categories: { set: categories.map(category => ({ name: category })) },
        chains: { set: chains.map(chain => ({ name: chain })) },
        twitter,
        telegram,
        discord,
        coingecko,
        academyQuestions: {
          deleteMany: {}, // Clear old questions and answers
          create: quizQuestions.map((quizQuestion, index) => ({
            initialQuestionId: initialAnswers[index].initialQuestionId,
            answer: initialAnswers[index].answer,
            quizQuestion: quizQuestion.quizQuestion,
            choices: {
              create: quizQuestion.choices.map((choice, choiceIndex) => ({
                text: choice,
                isCorrect: quizQuestion.correct.includes(choiceIndex),
              })),
            },
          })),
        },
        tokenomics,
        teamBackground,
        congratsVideo,
        getStarted,
        raffles: {
          deleteMany: {},
          create: raffles.map(raffle => ({
            amount: parseInt(raffle.amount, 10),
            reward: raffle.reward,
            currency: raffle.currency,
            chain: raffle.chain,
            dates: raffle.dates,
            totalPool: parseInt(raffle.totalPool, 10),
          })),
        },
        quests: {
          deleteMany: {},
          create: quests.map(quest => ({
            name: quest.name,
            link: quest.link,
            platform: quest.platform,
          })),
        },
        logoUrl,
        coverPhotoUrl,
        webpageUrl,
      },
    });

    res.json({ message: 'Academy updated successfully', academy: updatedAcademy });
  } catch (error) {
    console.error('Error updating academy:', error);
    res.status(500).json({ error: 'Error updating academy' });
  }
});

// Record user responses for quiz questions
app.post('/api/user-responses', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { academyQuestionId, chosenChoices } = req.body;

    const correctChoices = await prisma.choice.findMany({
      where: {
        academyQuestionId,
        isCorrect: true,
      },
    });

    // Calculate points based on the correct choices
    const pointsAwarded = correctChoices.every(correctChoice =>
      chosenChoices.includes(correctChoice.id)
    )
      ? 10 // Award points if all correct choices are selected
      : 0;

    const response = await prisma.userResponse.create({
      data: {
        userId,
        academyQuestionId,
        chosenChoices: { connect: chosenChoices.map(choiceId => ({ id: choiceId })) },
        pointsAwarded,
      },
    });

    res.status(201).json({ message: 'User response recorded successfully', response });
  } catch (error) {
    console.error('Error recording user response:', error);
    res.status(500).json({ error: 'Error recording user response' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

