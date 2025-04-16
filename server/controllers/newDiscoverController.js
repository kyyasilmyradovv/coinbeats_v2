const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');
const { format } = require('date-fns');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllEducators = asyncHandler(async (req, res, next) => {
  const { limit, offset } = req.query;
  if (limit > 40) limit = 40;

  const educators = await prisma.educator.findMany({
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

exports.getAllTutorials = asyncHandler(async (req, res, next) => {
  const { limit, offset } = req.query;
  if (limit > 40) limit = 40;

  const tutorials = await prisma.tutorial.findMany({
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

exports.getAllPodcasts = asyncHandler(async (req, res, next) => {
  const { limit, offset } = req.query;
  if (limit > 40) limit = 40;

  const podcasts = await prisma.podcast.findMany({
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

exports.getAllChannels = asyncHandler(async (req, res, next) => {
  const { limit, offset } = req.query;
  if (limit > 40) limit = 40;

  const channels = await prisma.youtubeChannel.findMany({
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

exports.getAllGroups = asyncHandler(async (req, res, next) => {
  const { limit, offset } = req.query;
  if (limit > 40) limit = 40;

  const groups = await prisma.telegramGroup.findMany({
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
