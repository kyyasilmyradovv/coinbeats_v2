const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');
const { format } = require('date-fns');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllEducators = asyncHandler(async (req, res, next) => {
  // Handle queries
  let { keyword, categoryId, chainId, limit, offset } = req.query;
  if (limit > 40) limit = 40;

  // Generate where contition
  const where = {};
  if (keyword && keyword.trim().length > 0) {
    where.name = { contains: keyword.trim(), mode: 'insensitive' };
  }
  if (categoryId) {
    where.categories = { some: { id: +categoryId } };
  }
  if (chainId) {
    where.chains = { some: { id: +chainId } };
  }

  const educators = await prisma.educator.findMany({
    where,
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
      coverPhotoUrl: true,
      logoUrl: true,
      chains: { select: { name: true } },
      categories: { select: { name: true } },
      _count: { select: { lessons: true, chains: true, categories: true } },
    },
    take: +limit || 20,
    skip: +offset || 0,
  });

  res.status(200).json(educators);
});

exports.getEducator = asyncHandler(async (req, res, next) => {
  const educator = await prisma.educator.findFirst({
    where: { id: +req.params.id },
    include: {
      chains: { select: { name: true } },
      categories: { select: { name: true } },
      lessons: true,
      _count: { select: { lessons: true, chains: true, categories: true } },
    },
  });

  res.status(200).json(educator);
});

exports.getAllTutorials = asyncHandler(async (req, res, next) => {
  // Handle queries
  let { keyword, categoryId, chainId, limit, offset } = req.query;
  if (limit > 40) limit = 40;

  // Generate where condition
  const where = {};
  if (keyword && keyword.trim().length > 0) {
    where.title = { contains: keyword.trim(), mode: 'insensitive' };
  }
  if (categoryId) {
    where.categories = { some: { id: +categoryId } };
  }
  if (chainId) {
    where.chains = { some: { id: +chainId } };
  }

  const tutorials = await prisma.tutorial.findMany({
    where,
    select: {
      id: true,
      title: true,
      description: true,
      coverPhotoUrl: true,
      logoUrl: true,
      chains: { select: { name: true } },
      categories: { select: { name: true } },
      _count: { select: { chains: true, categories: true } },
    },
    take: +limit || 20,
    skip: +offset || 0,
  });

  res.status(200).json(tutorials);
});

exports.getTutorial = asyncHandler(async (req, res, next) => {
  const tutorial = await prisma.tutorial.findFirst({
    where: { id: +req.params.id },
    include: {
      chains: { select: { name: true } },
      categories: { select: { name: true } },
      _count: { select: { chains: true, categories: true } },
    },
  });

  res.status(200).json(tutorial);
});

exports.getAllPodcasts = asyncHandler(async (req, res, next) => {
  // Handle queries
  let { keyword, categoryId, chainId, limit, offset } = req.query;
  if (limit > 40) limit = 40;

  // Generate where condition
  const where = {};
  if (keyword && keyword.trim().length > 0) {
    where.name = { contains: keyword.trim(), mode: 'insensitive' };
  }
  if (categoryId) {
    where.categories = { some: { id: +categoryId } };
  }
  if (chainId) {
    where.chains = { some: { id: +chainId } };
  }

  const podcasts = await prisma.podcast.findMany({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      coverPhotoUrl: true,
      logoUrl: true,
      chains: { select: { name: true } },
      categories: { select: { name: true } },
      _count: { select: { chains: true, categories: true } },
    },
    take: +limit || 20,
    skip: +offset || 0,
  });

  res.status(200).json(podcasts);
});

exports.getPodcast = asyncHandler(async (req, res, next) => {
  const podcast = await prisma.podcast.findFirst({
    where: { id: +req.params.id },
    include: {
      chains: { select: { name: true } },
      categories: { select: { name: true } },
      _count: { select: { chains: true, categories: true } },
    },
  });

  res.status(200).json(podcast);
});

exports.getAllChannels = asyncHandler(async (req, res, next) => {
  // Handle queries
  let { keyword, categoryId, chainId, limit, offset } = req.query;
  if (limit > 40) limit = 40;

  // Generate where condition
  const where = {};
  if (keyword && keyword.trim().length > 0) {
    where.name = { contains: keyword.trim(), mode: 'insensitive' };
  }
  if (categoryId) {
    where.categories = { some: { id: +categoryId } };
  }
  if (chainId) {
    where.chains = { some: { id: +chainId } };
  }

  const channels = await prisma.youtubeChannel.findMany({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      coverPhotoUrl: true,
      logoUrl: true,
      chains: { select: { name: true } },
      categories: { select: { name: true } },
      _count: { select: { chains: true, categories: true } },
    },
    take: +limit || 20,
    skip: +offset || 0,
  });

  res.status(200).json(channels);
});

exports.getChannel = asyncHandler(async (req, res, next) => {
  const channel = await prisma.youtubeChannel.findFirst({
    where: { id: +req.params.id },
    include: {
      chains: { select: { name: true } },
      categories: { select: { name: true } },
      _count: { select: { chains: true, categories: true } },
    },
  });

  res.status(200).json(channel);
});

exports.getAllGroups = asyncHandler(async (req, res, next) => {
  // Handle queries
  let { keyword, categoryId, chainId, limit, offset } = req.query;
  if (limit > 40) limit = 40;

  // Generate where condition
  const where = {};
  if (keyword && keyword.trim().length > 0) {
    where.name = { contains: keyword.trim(), mode: 'insensitive' };
  }
  if (categoryId) {
    where.categories = { some: { id: +categoryId } };
  }
  if (chainId) {
    where.chains = { some: { id: +chainId } };
  }

  const groups = await prisma.telegramGroup.findMany({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      coverPhotoUrl: true,
      logoUrl: true,
      chains: { select: { name: true } },
      categories: { select: { name: true } },
      _count: { select: { chains: true, categories: true } },
    },
    take: +limit || 20,
    skip: +offset || 0,
  });

  res.status(200).json(groups);
});

exports.getGroup = asyncHandler(async (req, res, next) => {
  const gorup = await prisma.telegramGroup.findFirst({
    where: { id: +req.params.id },
    include: {
      chains: { select: { name: true } },
      categories: { select: { name: true } },
      _count: { select: { chains: true, categories: true } },
    },
  });

  res.status(200).json(gorup);
});
