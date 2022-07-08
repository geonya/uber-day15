import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Episode } from 'src/podcast/entities/episode.entity';
import { Podcast } from 'src/podcast/entities/podcast.entity';
import { PodcastsService } from 'src/podcast/podcasts.service';
import { Repository } from 'typeorm';

const mockPodcastRepository = () => ({
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});

const mockEpisodeRepository = () => ({
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('PodcastService', () => {
  let podcastService: PodcastsService;
  let podcastRepository: MockRepository<Podcast>;
  let episodeRepository: MockRepository<Episode>;
  const mockPocastArgs = {
    title: 'sdfj',
    category: 'sdf',
  };
  const mockPodcast = {
    id: 1,
    title: 'sdfj',
    category: 'sdf',
    rating: 3,
  };
  const mockPodcastWithEpisodes = {
    ...mockPodcast,
    id: 2,
    episodes: [{ id: 1, title: 'shidf', category: 'sdfj' }],
  };
  const InternalServerErrorOutput = {
    ok: false,
    error: 'Internal server error occurred.',
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PodcastsService,
        {
          provide: getRepositoryToken(Podcast),
          useValue: mockPodcastRepository(),
        },
        {
          provide: getRepositoryToken(Episode),
          useValue: mockEpisodeRepository(),
        },
      ],
    }).compile();
    podcastService = module.get<PodcastsService>(PodcastsService);
    podcastRepository = module.get(getRepositoryToken(Podcast));
    episodeRepository = module.get(getRepositoryToken(Episode));
  });

  it('sould be defined', () => {
    expect(podcastService).toBeDefined();
  });

  describe('getAllPodcasts', () => {
    it('should fail if podcasts not found', async () => {
      podcastRepository.find.mockResolvedValue(null);
      const result = await podcastService.getAllPodcasts();
      expect(result).toEqual({
        ok: true,
        podcasts: null,
      });
    });
    it('should fail on exception', async () => {
      podcastRepository.find.mockRejectedValue(new Error());
      const result = await podcastService.getAllPodcasts();
      expect(podcastRepository.find).toHaveBeenCalledTimes(1);
      expect(podcastRepository.find).toHaveBeenCalledWith();
      expect(result).toEqual(InternalServerErrorOutput);
    });
    it('should find podcasts', async () => {
      const mockPodcasts = [{ id: 1, rating: 0, category: 'sf', title: 'sdf' }];
      podcastRepository.find.mockResolvedValue(mockPodcasts);
      const result = await podcastService.getAllPodcasts();
      expect(result).toEqual({
        ok: true,
        podcasts: mockPodcasts,
      });
    });
  });
  describe('createPodcast', () => {
    it('should success on creating podcast', async () => {
      const savePodCastResturn = {
        id: 1,
        ...mockPocastArgs,
      };
      podcastRepository.create.mockReturnValue(mockPocastArgs);
      podcastRepository.save.mockResolvedValue(savePodCastResturn);
      const result = await podcastService.createPodcast(mockPocastArgs);
      expect(podcastRepository.create).toHaveBeenCalledTimes(1);
      expect(podcastRepository.create).toHaveBeenCalledWith(mockPocastArgs);
      expect(podcastRepository.save).toHaveBeenCalledTimes(1);
      expect(podcastRepository.save).toHaveBeenCalledWith(mockPocastArgs);
      expect(result).toEqual({
        ok: true,
        id: 1,
      });
    });
    it('should fail on exception', async () => {
      podcastRepository.save.mockRejectedValue(new Error());
      const result = await podcastService.createPodcast(mockPocastArgs);
      expect(result).toEqual(InternalServerErrorOutput);
    });
  });

  describe('getPodcast', () => {
    it('should fail on not found', async () => {
      podcastRepository.findOne.mockResolvedValue(null);
      const result = await podcastService.getPodcast(mockPodcast.id);
      expect(podcastRepository.findOne).toHaveBeenCalledTimes(1);
      expect(podcastRepository.findOne).toHaveBeenCalledWith(
        { id: mockPodcast.id },
        { relations: ['episodes'] },
      );
      expect(result).toEqual({
        ok: false,
        error: `Podcast with id ${mockPodcast.id} not found`,
      });
    });
    it('should success when get a podcast', async () => {
      podcastRepository.findOne.mockResolvedValue(mockPodcast);
      const result = await podcastService.getPodcast(mockPodcast.id);
      expect(podcastRepository.findOne).toHaveBeenCalledTimes(1);
      expect(podcastRepository.findOne).toHaveBeenCalledWith(
        { id: mockPodcast.id },
        { relations: ['episodes'] },
      );
      expect(result).toEqual({
        ok: true,
        podcast: mockPodcast,
      });
    });
    it('should fail on exception', async () => {
      podcastRepository.findOne.mockRejectedValue(new Error());
      const result = await podcastService.getPodcast(mockPodcast.id);
      expect(podcastRepository.findOne).toHaveBeenCalledTimes(1);
      expect(podcastRepository.findOne).toHaveBeenCalledWith(
        { id: mockPodcast.id },
        { relations: ['episodes'] },
      );
      expect(result).toEqual(InternalServerErrorOutput);
    });
  });
  describe('deletePodcast', () => {
    it('should fail on not found', async () => {
      podcastRepository.findOne.mockResolvedValue(null);
      const result = await podcastService.deletePodcast(mockPodcast.id);
      expect(podcastRepository.findOne).toHaveBeenCalledTimes(1);
      expect(podcastRepository.findOne).toHaveBeenCalledWith(
        { id: mockPodcast.id },
        { relations: ['episodes'] },
      );
      expect(result).toEqual({
        ok: false,
        error: `Podcast with id ${mockPodcast.id} not found`,
      });
    });
    it('should success delete', async () => {
      podcastRepository.findOne.mockResolvedValue(mockPodcast);
      const result = await podcastService.deletePodcast(mockPodcast.id);
      expect(podcastRepository.delete).toHaveBeenCalledTimes(1);
      expect(podcastRepository.delete).toHaveBeenCalledWith({
        id: mockPodcast.id,
      });
      expect(result).toEqual({ ok: true });
    });
    it('shoud fail on exception', async () => {
      podcastRepository.findOne.mockResolvedValue(mockPodcast);
      podcastRepository.delete.mockRejectedValue(new Error());
      const result = await podcastService.deletePodcast(mockPodcast.id);
      expect(result).toEqual(InternalServerErrorOutput);
    });
  });
  describe('updatePodcast', () => {
    const updatePodcastPayload = {
      ...mockPodcast,
    };
    const updatePodcastInputs = {
      id: mockPodcast.id,
      payload: updatePodcastPayload,
    };
    it('should fail on not found', async () => {
      podcastRepository.findOne.mockResolvedValue(null);
      const result = await podcastService.updatePodcast(updatePodcastInputs);
      expect(podcastRepository.findOne).toHaveBeenCalledTimes(1);
      expect(podcastRepository.findOne).toHaveBeenCalledWith(
        { id: mockPodcast.id },
        { relations: ['episodes'] },
      );
      expect(result).toEqual({
        ok: false,
        error: `Podcast with id ${mockPodcast.id} not found`,
      });
    });
    it('should fail on outraged rating number', async () => {
      const updatedPodcastOutRangedRatingNumberArgs = {
        ...updatePodcastPayload,
        rating: -1,
      };
      podcastRepository.findOne.mockResolvedValue(
        updatedPodcastOutRangedRatingNumberArgs,
      );
      const result = await podcastService.updatePodcast({
        id: mockPodcast.id,
        payload: updatedPodcastOutRangedRatingNumberArgs,
      });
      expect(podcastRepository.findOne).toHaveBeenCalledTimes(1);
      expect(podcastRepository.findOne).toHaveBeenCalledWith(
        { id: mockPodcast.id },
        { relations: ['episodes'] },
      );
      expect(result).toEqual({
        ok: false,
        error: 'Rating must be between 1 and 5.',
      });
    });
    it('should success on saving update', async () => {
      podcastRepository.findOne.mockResolvedValue(mockPodcast);
      podcastRepository.save.mockResolvedValue(mockPodcast);
      const result = await podcastService.updatePodcast(updatePodcastInputs);
      expect(podcastRepository.save).toHaveBeenCalledTimes(1);
      expect(podcastRepository.save).toHaveBeenCalledWith(mockPodcast);
      expect(result).toEqual({
        ok: true,
      });
    });
    it('should fail on exeption', async () => {
      podcastRepository.findOne.mockResolvedValue(mockPodcast);
      podcastRepository.save.mockRejectedValue(new Error());
      const result = await podcastService.updatePodcast(updatePodcastInputs);
      expect(result).toEqual(InternalServerErrorOutput);
    });
  });
  describe('getEpisodes', () => {
    it('should fail on podcast not found', async () => {
      podcastRepository.findOne.mockResolvedValue(null);
      const result = await podcastService.getEpisodes(
        mockPodcastWithEpisodes.id,
      );
      expect(result).toEqual({
        ok: false,
        error: `Podcast with id ${mockPodcastWithEpisodes.id} not found`,
      });
    });
    it('should success return episodes', async () => {
      podcastRepository.findOne.mockResolvedValue(mockPodcastWithEpisodes);
      const result = await podcastService.getEpisodes(
        mockPodcastWithEpisodes.id,
      );
      expect(result).toEqual({
        ok: true,
        episodes: mockPodcastWithEpisodes.episodes,
      });
    });
    it('should fail on exception', async () => {
      podcastRepository.findOne.mockResolvedValue(mockPodcast);
      const result = await podcastService.getEpisodes(mockPodcast.id);
      expect(result).toEqual(InternalServerErrorOutput);
    });
  });
  describe('getEpisode', () => {
    const mockEpisode = {
      id: 1,
      title: 'shidf',
      category: 'sdfj',
    };
    it('should fail on podcast not found', async () => {
      podcastRepository.findOne.mockResolvedValue(null);
      const result = await podcastService.getEpisode({
        podcastId: mockPodcast.id,
        episodeId: mockEpisode.id,
      });
      expect(result).toEqual({
        ok: false,
        error: `Podcast with id ${mockPodcast.id} not found`,
      });
    });
    it('should fail on not found episode', async () => {
      podcastRepository.findOne.mockResolvedValue(mockPodcastWithEpisodes);
      const result = await podcastService.getEpisode({
        podcastId: mockPodcast.id,
        episodeId: 999,
      });
      expect(result).toEqual({
        ok: false,
        error: `Episode with id ${999} not found in podcast with id ${
          mockPodcast.id
        }`,
      });
    });
    it('should success on getting episode', async () => {
      podcastRepository.findOne.mockResolvedValue(mockPodcastWithEpisodes);
      const result = await podcastService.getEpisode({
        podcastId: mockPodcastWithEpisodes.id,
        episodeId: mockEpisode.id,
      });
      expect(result).toEqual({
        ok: true,
        episode: mockEpisode,
      });
    });
    it('should fail on exception', async () => {
      const mockPocastWithoutEpisodes = {
        id: 3,
        episodes: [],
      };
      podcastRepository.findOne.mockResolvedValue(mockPocastWithoutEpisodes);
      const result = await podcastService.getEpisode({
        podcastId: mockPocastWithoutEpisodes.id,
        episodeId: mockEpisode.id,
      });
      expect(result).toEqual(InternalServerErrorOutput);
    });
  });
  describe('createEpisode', () => {
    const podcastId = 2;
    const createEpisodeInputs = {
      title: 'sfdj',
      category: 'dfj',
    };

    it('should fail on not found podcast', async () => {
      podcastRepository.findOne.mockResolvedValue(null);
      const result = await podcastService.createEpisode({
        podcastId,
        ...createEpisodeInputs,
      });
      expect(result).toEqual({
        ok: false,
        error: `Podcast with id ${podcastId} not found`,
      });
    });
    it('should success on creating episode', async () => {
      podcastRepository.findOne.mockResolvedValue(mockPodcastWithEpisodes);
      episodeRepository.create.mockReturnValue(createEpisodeInputs);
      episodeRepository.save.mockResolvedValue({
        ...createEpisodeInputs,
        id: 2,
      });
      const result = await podcastService.createEpisode({
        podcastId,
        ...createEpisodeInputs,
      });
      expect(episodeRepository.create).toHaveBeenCalledTimes(1);
      expect(episodeRepository.create).toHaveBeenCalledWith({
        title: 'sfdj',
        category: 'dfj',
      });
      expect(episodeRepository.save).toHaveBeenCalledTimes(1);
      expect(episodeRepository.save).toHaveBeenCalledWith(createEpisodeInputs);
      expect(result).toEqual({
        ok: true,
        id: 2,
      });
    });
    it('should fail on exception', async () => {
      podcastRepository.findOne.mockResolvedValue(mockPodcastWithEpisodes);
      episodeRepository.create.mockReturnValue(createEpisodeInputs);
      episodeRepository.save.mockRejectedValue(new Error());
      const result = await podcastService.createEpisode({
        podcastId,
        ...createEpisodeInputs,
      });
      expect(result).toEqual(InternalServerErrorOutput);
    });
  });
  describe('deleteEpisode', () => {
    it('should fail on found podcast', async () => {
      podcastRepository.findOne.mockResolvedValue(null);
      const result = await podcastService.deleteEpisode({
        podcastId: 2,
        episodeId: 1,
      });
      expect(result).toEqual({
        ok: false,
        error: `Podcast with id ${2} not found`,
      });
    });
    it('should fail on found epiosde', async () => {
      podcastRepository.findOne.mockResolvedValue(mockPodcastWithEpisodes);
      const result = await podcastService.deleteEpisode({
        podcastId: mockPodcast.id,
        episodeId: 999,
      });
      expect(result).toEqual({
        ok: false,
        error: `Episode with id ${999} not found in podcast with id ${
          mockPodcast.id
        }`,
      });
    });
    it('should success on delete', async () => {
      podcastRepository.findOne.mockResolvedValue(mockPodcastWithEpisodes);
      const result = await podcastService.deleteEpisode({
        podcastId: mockPodcastWithEpisodes.id,
        episodeId: 1,
      });
      expect(episodeRepository.delete).toHaveBeenCalledTimes(1);
      expect(episodeRepository.delete).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual({ ok: true });
    });
    it('should fail on exception', async () => {
      podcastRepository.findOne.mockResolvedValue(mockPodcastWithEpisodes);
      episodeRepository.delete.mockRejectedValue(new Error());
      const result = await podcastService.deleteEpisode({
        podcastId: mockPodcastWithEpisodes.id,
        episodeId: 1,
      });
      expect(episodeRepository.delete).toHaveBeenCalledTimes(1);
      expect(episodeRepository.delete).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(InternalServerErrorOutput);
    });
  });
  describe('updateEpisode', () => {
    const updatingEpisodeInputs = {
      title: 'kasdjf',
      category: 'sdfjk',
    };
    it('should fail on not found podcast', async () => {
      podcastRepository.findOne.mockResolvedValue(null);
      const result = await podcastService.updateEpisode({
        podcastId: 2,
        episodeId: 1,
      });
      expect(result).toEqual({
        ok: false,
        error: `Podcast with id ${2} not found`,
      });
    });
    it('should fail on not found episode', async () => {
      podcastRepository.findOne.mockResolvedValue(mockPodcastWithEpisodes);
      const result = await podcastService.updateEpisode({
        podcastId: mockPodcast.id,
        episodeId: 999,
      });
      expect(result).toEqual({
        ok: false,
        error: `Episode with id ${999} not found in podcast with id ${
          mockPodcast.id
        }`,
      });
    });
    it('should success on update', async () => {
      podcastRepository.findOne.mockResolvedValue(mockPodcastWithEpisodes);
      episodeRepository.save.mockResolvedValue({
        id: 1,
        ...updatingEpisodeInputs,
      });
      const result = await podcastService.updateEpisode({
        podcastId: 2,
        episodeId: 1,
        ...updatingEpisodeInputs,
      });
      expect(episodeRepository.save).toHaveBeenCalledTimes(1);
      expect(episodeRepository.save).toHaveBeenCalledWith({
        id: 1,
        ...updatingEpisodeInputs,
      });
      expect(result).toEqual({ ok: true });
    });
    it('should fail on except', async () => {
      podcastRepository.findOne.mockResolvedValue(mockPodcastWithEpisodes);
      episodeRepository.save.mockRejectedValue(new Error());
      const result = await podcastService.updateEpisode({
        podcastId: 2,
        episodeId: 1,
        ...updatingEpisodeInputs,
      });
      expect(result).toEqual(InternalServerErrorOutput);
    });
  });
});
