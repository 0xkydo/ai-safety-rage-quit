import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { computePublicityScore } from "../src/lib/publicity-score";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const departures = [
  {
    personName: "Jan Leike",
    role: "Co-lead of Superalignment Team",
    company: "OPENAI" as const,
    departureDate: new Date("2024-05-15"),
    summary:
      "Resigned from OpenAI citing disagreements over safety priorities. Publicly stated that safety culture had 'taken a backseat to shiny products' and that OpenAI was not doing enough on superalignment. Joined Anthropic shortly after.",
    status: "CONFIRMED" as const,
    tweets: [
      {
        tweetId: "1790835318091636961",
        url: "https://x.com/janleike/status/1790835318091636961",
        text: "I resigned from OpenAI. Here is why.",
        likes: 52000,
        retweets: 12000,
        replies: 3200,
        views: 18000000,
      },
    ],
    newsArticles: [
      {
        url: "https://www.nytimes.com/2024/05/17/technology/openai-jan-leike-safety.html",
        title: "Top OpenAI Safety Researcher Resigns, Citing Safety Concerns",
        source: "New York Times",
        publishedAt: new Date("2024-05-17"),
      },
      {
        url: "https://www.theverge.com/2024/5/17/24159095/openai-jan-leike-superalignment-safety",
        title: "OpenAI's superalignment co-lead leaves over safety disagreements",
        source: "The Verge",
        publishedAt: new Date("2024-05-17"),
      },
    ],
  },
  {
    personName: "Ilya Sutskever",
    role: "Co-founder & Chief Scientist",
    company: "OPENAI" as const,
    departureDate: new Date("2024-05-14"),
    summary:
      "Departed OpenAI after leading the board's brief ouster of Sam Altman in November 2023. Co-founded Safe Superintelligence Inc. (SSI), a company focused exclusively on safe superintelligence development.",
    status: "CONFIRMED" as const,
    tweets: [
      {
        tweetId: "1790517455628198322",
        url: "https://x.com/iaborodinov/status/1790517455628198322",
        text: "After almost 10 years, I have made the decision to leave OpenAI.",
        likes: 68000,
        retweets: 9500,
        replies: 4100,
        views: 22000000,
      },
    ],
    newsArticles: [
      {
        url: "https://www.reuters.com/technology/openai-co-founder-sutskever-leaves-company-2024-05-14/",
        title: "OpenAI co-founder Ilya Sutskever leaves the company",
        source: "Reuters",
        publishedAt: new Date("2024-05-14"),
      },
      {
        url: "https://www.bloomberg.com/news/articles/2024-05-14/openai-co-founder-ilya-sutskever-leaves-startup",
        title: "OpenAI Co-Founder Ilya Sutskever Leaves Startup He Helped Create",
        source: "Bloomberg",
        publishedAt: new Date("2024-05-14"),
      },
      {
        url: "https://techcrunch.com/2024/05/14/ilya-sutskever-openai-cofounder-departs/",
        title: "Ilya Sutskever, OpenAI co-founder and long-time chief scientist, departs",
        source: "TechCrunch",
        publishedAt: new Date("2024-05-14"),
      },
    ],
  },
  {
    personName: "Daniel Kokotajlo",
    role: "Researcher, Governance Team",
    company: "OPENAI" as const,
    departureDate: new Date("2024-04-01"),
    summary:
      "Left OpenAI and forfeited significant equity after refusing to sign a non-disparagement agreement. Has been vocal about OpenAI's approach to safety and governance, including concerns about the pace of capability development.",
    status: "CONFIRMED" as const,
    tweets: [
      {
        tweetId: "1795532820041158766",
        url: "https://x.com/DanielKokworst/status/1795532820041158766",
        text: "I left OpenAI because I lost confidence that it would behave responsibly around the time of AGI.",
        likes: 14000,
        retweets: 3800,
        replies: 1200,
        views: 5000000,
      },
    ],
    newsArticles: [
      {
        url: "https://www.vox.com/future-perfect/2024/5/17/24158403/openai-departures-daniel-kokotajlo-safety",
        title: "He quit OpenAI and missed millions. He thinks it was worth it.",
        source: "Vox",
        publishedAt: new Date("2024-05-17"),
      },
    ],
  },
  {
    personName: "Gretchen Krueger",
    role: "Policy Researcher",
    company: "OPENAI" as const,
    departureDate: new Date("2024-05-15"),
    summary:
      "Departed alongside Jan Leike from OpenAI's safety team. Previously worked on OpenAI's usage policies and safety communications.",
    status: "CONFIRMED" as const,
    tweets: [],
    newsArticles: [
      {
        url: "https://www.theinformation.com/articles/openai-safety-researcher-gretchen-krueger-leaves",
        title: "Another OpenAI Safety Researcher Departs",
        source: "The Information",
        publishedAt: new Date("2024-05-16"),
      },
    ],
  },
  {
    personName: "Dario Amodei",
    role: "VP of Research",
    company: "OPENAI" as const,
    departureDate: new Date("2021-01-28"),
    summary:
      "Left OpenAI to co-found Anthropic due to disagreements about OpenAI's commercial direction and approach to AI safety. Anthropic has since become one of the leading AI safety-focused companies.",
    status: "CONFIRMED" as const,
    tweets: [],
    newsArticles: [
      {
        url: "https://www.wired.com/story/openai-employees-quit-start-rival-anthropic/",
        title: "OpenAI Employees Quit to Start Safety-Focused Rival",
        source: "Wired",
        publishedAt: new Date("2021-01-28"),
      },
      {
        url: "https://www.technologyreview.com/2021/02/17/1018234/openai-brain-drain-safety-research/",
        title: "The messy, secretive reality behind OpenAI's bid to save the world",
        source: "MIT Technology Review",
        publishedAt: new Date("2021-02-17"),
      },
    ],
  },
  {
    personName: "Chris Olah",
    role: "Research Scientist (Interpretability)",
    company: "GOOGLE_DEEPMIND" as const,
    departureDate: new Date("2021-02-01"),
    summary:
      "Left Google Brain to join Anthropic, where he now leads interpretability research. Pioneer of neural network interpretability and mechanistic interpretability.",
    status: "CONFIRMED" as const,
    tweets: [],
    newsArticles: [
      {
        url: "https://www.technologyreview.com/2021/02/17/1018234/openai-brain-drain-safety-research/",
        title: "Key AI safety researchers depart Google for Anthropic",
        source: "MIT Technology Review",
        publishedAt: new Date("2021-02-17"),
      },
    ],
  },
  {
    personName: "William Saunders",
    role: "Research Engineer",
    company: "OPENAI" as const,
    departureDate: new Date("2024-02-01"),
    summary:
      "Left OpenAI citing safety concerns. Publicly discussed the difficulty of raising safety concerns internally and the pressure to prioritize product launches.",
    status: "CONFIRMED" as const,
    tweets: [
      {
        tweetId: "1795135684967645445",
        url: "https://x.com/wds_saunders/status/1795135684967645445",
        text: "I left OpenAI earlier this year. I've been thinking about how to talk about this.",
        likes: 5200,
        retweets: 1400,
        replies: 420,
        views: 2000000,
      },
    ],
    newsArticles: [],
  },
  {
    personName: "Geoffrey Hinton",
    role: "VP and Engineering Fellow",
    company: "GOOGLE_DEEPMIND" as const,
    departureDate: new Date("2023-05-01"),
    summary:
      "Resigned from Google to speak freely about AI risks. The 'Godfather of AI' expressed regret over his life's work and warned about existential risks from advanced AI systems.",
    status: "CONFIRMED" as const,
    tweets: [],
    newsArticles: [
      {
        url: "https://www.nytimes.com/2023/05/01/technology/ai-google-chatbot-engineer-quits-hinton.html",
        title: "'The Godfather of A.I.' Leaves Google and Warns of Danger Ahead",
        source: "New York Times",
        publishedAt: new Date("2023-05-01"),
      },
      {
        url: "https://www.bbc.com/news/world-us-canada-65452940",
        title: "AI 'godfather' Geoffrey Hinton warns of dangers as he quits Google",
        source: "BBC",
        publishedAt: new Date("2023-05-02"),
      },
      {
        url: "https://www.reuters.com/technology/ai-pioneer-geoffrey-hinton-says-he-quit-google-speak-freely-risks-2023-05-01/",
        title: "AI pioneer Geoffrey Hinton quits Google to speak freely about risks",
        source: "Reuters",
        publishedAt: new Date("2023-05-01"),
      },
    ],
  },
  {
    personName: "Timnit Gebru",
    role: "Co-lead of Ethical AI Team",
    company: "GOOGLE_DEEPMIND" as const,
    departureDate: new Date("2020-12-02"),
    summary:
      "Fired from Google after co-authoring a paper on the risks of large language models. The incident sparked major controversy about research freedom and AI ethics at major labs. Founded the DAIR Institute.",
    status: "CONFIRMED" as const,
    tweets: [
      {
        tweetId: "1334354780827549696",
        url: "https://x.com/timaborednotmit/status/1334354780827549696",
        text: "I was fired by @Google for... writing a research paper.",
        likes: 42000,
        retweets: 18000,
        replies: 5600,
        views: 12000000,
      },
    ],
    newsArticles: [
      {
        url: "https://www.technologyreview.com/2020/12/04/1013294/google-ai-ethics-research-paper-forced-out-timnit-gebru/",
        title: "Google fired its star AI researcher one year ago. The fallout continues.",
        source: "MIT Technology Review",
        publishedAt: new Date("2020-12-04"),
      },
      {
        url: "https://www.nytimes.com/2020/12/03/technology/google-researcher-timnit-gebru.html",
        title: "Google Researcher Says She Was Fired Over Paper Highlighting Bias in A.I.",
        source: "New York Times",
        publishedAt: new Date("2020-12-03"),
      },
    ],
  },
  {
    personName: "Miles Brundage",
    role: "Head of Policy Research",
    company: "OPENAI" as const,
    departureDate: new Date("2024-09-20"),
    summary:
      "Left OpenAI after leading policy research for several years. His departure was part of a broader exodus of safety-focused personnel from OpenAI during 2024.",
    status: "CONFIRMED" as const,
    tweets: [
      {
        tweetId: "1837200040793604400",
        url: "https://x.com/Miles_Brundage/status/1837200040793604400",
        text: "After 5.5 years at OpenAI, I've decided to leave and start something new focused on AI policy.",
        likes: 8200,
        retweets: 1600,
        replies: 680,
        views: 3200000,
      },
    ],
    newsArticles: [
      {
        url: "https://www.theinformation.com/articles/openai-policy-head-miles-brundage-departs",
        title: "OpenAI Policy Head Miles Brundage Departs in Latest Safety Exodus",
        source: "The Information",
        publishedAt: new Date("2024-09-20"),
      },
    ],
  },
];

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.newsArticle.deleteMany();
  await prisma.tweet.deleteMany();
  await prisma.departure.deleteMany();

  for (const d of departures) {
    const score = computePublicityScore(d.tweets, d.newsArticles.length);

    const departure = await prisma.departure.create({
      data: {
        personName: d.personName,
        role: d.role,
        company: d.company,
        departureDate: d.departureDate,
        summary: d.summary,
        status: d.status,
        publicityScore: score,
        tweets: {
          create: d.tweets.map((t) => ({
            tweetId: t.tweetId,
            url: t.url,
            text: t.text,
            likes: t.likes,
            retweets: t.retweets,
            replies: t.replies,
            views: t.views,
            metricsUpdatedAt: new Date(),
          })),
        },
        newsArticles: {
          create: d.newsArticles.map((n) => ({
            url: n.url,
            title: n.title,
            source: n.source,
            publishedAt: n.publishedAt,
          })),
        },
      },
    });

    console.log(
      `  Created: ${departure.personName} (score: ${score.toFixed(1)})`
    );
  }

  console.log(`\nSeeded ${departures.length} departures.`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
