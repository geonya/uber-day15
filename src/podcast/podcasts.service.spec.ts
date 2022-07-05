import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Episode } from 'src/podcast/entities/episode.entity';
import { Podcast } from 'src/podcast/entities/podcast.entity';
import { PodcastsService } from 'src/podcast/podcasts.service';
import { Repository } from 'typeorm';

const mockRepository = () => ({
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

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PodcastsService,
        { provide: getRepositoryToken(Podcast), useValue: mockRepository() },
        { provide: getRepositoryToken(Episode), useValue: mockRepository() },
      ],
    }).compile();
    podcastService = module.get<PodcastsService>(PodcastsService);
    podcastRepository = module.get(getRepositoryToken(Podcast));
    episodeRepository = module.get(getRepositoryToken(Episode));
  });

  it('sould be defined', () => {
    expect(podcastService).toBeDefined();
  });

  it.todo('getAllPodcasts');
  it.todo('createPodcast');
  it.todo('getPodcast');
  it.todo('deletePodcast');
  it.todo('updatePodcast');
  it.todo('getEpisodes');
  it.todo('getEpisode');
  it.todo('createEpisode');
  it.todo('deleteEpisode');
  it.todo('updateEpisode');
});
