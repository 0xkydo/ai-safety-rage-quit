import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { computePublicityScore } from "../src/lib/publicity-score";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

type DepartureInput = {
  personName: string;
  role: string;
  company: "OPENAI" | "ANTHROPIC" | "GOOGLE_DEEPMIND";
  departureDate: Date;
  summary: string;
  status: "CONFIRMED" | "RUMORED";
  tweets: {
    tweetId: string;
    url: string;
    text: string;
    likes: number;
    retweets: number;
    replies: number;
    views: number;
  }[];
  newsArticles: {
    url: string;
    title: string;
    source: string;
    publishedAt: Date;
  }[];
};

const departures: DepartureInput[] = [
  // ===== OPENAI DEPARTURES =====
  {
    personName: "Jan Leike",
    role: "Co-lead of Superalignment Team",
    company: "OPENAI",
    departureDate: new Date("2024-05-15"),
    summary:
      "Resigned from OpenAI citing disagreements over safety priorities. Publicly stated that safety culture had 'taken a backseat to shiny products' and that OpenAI was not doing enough on superalignment. Joined Anthropic shortly after.",
    status: "CONFIRMED",
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
    company: "OPENAI",
    departureDate: new Date("2024-05-14"),
    summary:
      "Departed OpenAI after leading the board's brief ouster of Sam Altman in November 2023. Co-founded Safe Superintelligence Inc. (SSI), a company focused exclusively on safe superintelligence development.",
    status: "CONFIRMED",
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
    company: "OPENAI",
    departureDate: new Date("2024-04-01"),
    summary:
      "Left OpenAI and forfeited significant equity after refusing to sign a non-disparagement agreement. Has been vocal about OpenAI's approach to safety and governance, including concerns about the pace of capability development.",
    status: "CONFIRMED",
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
    company: "OPENAI",
    departureDate: new Date("2024-05-15"),
    summary:
      "Departed alongside Jan Leike from OpenAI's safety team. Previously worked on OpenAI's usage policies and safety communications.",
    status: "CONFIRMED",
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
    company: "OPENAI",
    departureDate: new Date("2021-01-28"),
    summary:
      "Left OpenAI to co-found Anthropic due to disagreements about OpenAI's commercial direction and approach to AI safety. Anthropic has since become one of the leading AI safety-focused companies.",
    status: "CONFIRMED",
    tweets: [],
    newsArticles: [
      {
        url: "https://www.wired.com/story/openai-employees-quit-start-rival-anthropic/",
        title: "OpenAI Employees Quit to Start Safety-Focused Rival",
        source: "Wired",
        publishedAt: new Date("2021-01-28"),
      },
    ],
  },
  {
    personName: "Daniela Amodei",
    role: "VP of Operations",
    company: "OPENAI",
    departureDate: new Date("2021-01-28"),
    summary:
      "Co-founded Anthropic with brother Dario over safety concerns. Now President of Anthropic. Part of the original exodus of safety-focused leadership from OpenAI.",
    status: "CONFIRMED",
    tweets: [],
    newsArticles: [],
  },
  {
    personName: "Tom Brown",
    role: "Lead Author of GPT-3",
    company: "OPENAI",
    departureDate: new Date("2021-01-28"),
    summary:
      "Co-founded Anthropic. Led the GPT-3 paper at OpenAI but felt safety wasn't the top priority. Later founded SafeAI in 2023.",
    status: "CONFIRMED",
    tweets: [],
    newsArticles: [],
  },
  {
    personName: "Jack Clark",
    role: "Policy Director",
    company: "OPENAI",
    departureDate: new Date("2021-01-28"),
    summary:
      "Co-founded Anthropic over concerns about OpenAI's drift from AI safety commitment. Now heads Anthropic's policy division.",
    status: "CONFIRMED",
    tweets: [],
    newsArticles: [],
  },
  {
    personName: "Sam McCandlish",
    role: "Researcher",
    company: "OPENAI",
    departureDate: new Date("2021-01-28"),
    summary:
      "Co-founded Anthropic. Now Chief Architect at Anthropic. Part of the safety team exodus from OpenAI.",
    status: "CONFIRMED",
    tweets: [],
    newsArticles: [],
  },
  {
    personName: "Jared Kaplan",
    role: "Researcher (Scaling Laws)",
    company: "OPENAI",
    departureDate: new Date("2021-01-28"),
    summary:
      "Co-founded Anthropic. Pioneered scaling laws for neural language models. Now Chief Science Officer at Anthropic.",
    status: "CONFIRMED",
    tweets: [],
    newsArticles: [],
  },
  {
    personName: "William Saunders",
    role: "Research Engineer",
    company: "OPENAI",
    departureDate: new Date("2024-02-01"),
    summary:
      "Left OpenAI citing safety concerns. Publicly discussed the difficulty of raising safety concerns internally and the pressure to prioritize product launches.",
    status: "CONFIRMED",
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
    personName: "Miles Brundage",
    role: "Head of Policy Research",
    company: "OPENAI",
    departureDate: new Date("2024-09-20"),
    summary:
      "Left OpenAI after leading policy research for several years. His departure was part of a broader exodus of safety-focused personnel from OpenAI during 2024.",
    status: "CONFIRMED",
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
  {
    personName: "Leopold Aschenbrenner",
    role: "Superalignment Team Researcher",
    company: "OPENAI",
    departureDate: new Date("2024-04-15"),
    summary:
      "Fired for allegedly leaking information after writing an internal memo about OpenAI's security being 'egregiously insufficient' to protect against theft of model weights by foreign actors. Later published 'Situational Awareness' essay on AI trajectory.",
    status: "CONFIRMED",
    tweets: [],
    newsArticles: [
      {
        url: "https://www.transformernews.ai/p/openai-employee-says-he-was-fired",
        title: "OpenAI employee says he was fired for raising security concerns",
        source: "Transformer News",
        publishedAt: new Date("2024-06-04"),
      },
    ],
  },
  {
    personName: "Pavel Izmailov",
    role: "Safety Team Researcher",
    company: "OPENAI",
    departureDate: new Date("2024-04-15"),
    summary:
      "Fired alongside Leopold Aschenbrenner for alleged information leaking. Was on OpenAI's safety team before being moved to reasoning research.",
    status: "CONFIRMED",
    tweets: [],
    newsArticles: [],
  },
  // John Schulman removed - explicitly said departure was NOT about safety, career move
  {
    personName: "Jacob Hilton",
    role: "Alignment Team Researcher",
    company: "OPENAI",
    departureDate: new Date("2023-09-01"),
    summary:
      "Left OpenAI. Was required to sign non-disparagement agreement to keep vested equity. Later expressed concern about the NDA practice. Now runs Alignment Research Center.",
    status: "CONFIRMED",
    tweets: [
      {
        tweetId: "1794090554730639591",
        url: "https://x.com/JacobHHilton/status/1794090554730639591",
        text: "I can confirm that OpenAI has a very restrictive non-disparagement clause.",
        likes: 3200,
        retweets: 890,
        replies: 340,
        views: 1500000,
      },
    ],
    newsArticles: [],
  },
  {
    personName: "Cullen O'Keefe",
    role: "Policy Researcher",
    company: "OPENAI",
    departureDate: new Date("2024-05-15"),
    summary:
      "Left OpenAI after 4.5 years. Confirmed he is not bound by a non-disparagement agreement, suggesting he may have forfeited equity to retain the right to criticize. Now Director of Research at Institute for Law & AI.",
    status: "CONFIRMED",
    tweets: [],
    newsArticles: [],
  },
  {
    personName: "Rosie Campbell",
    role: "Safety Policy Researcher",
    company: "OPENAI",
    departureDate: new Date("2024-12-01"),
    summary:
      "Left after 3.5 years. Cited being 'unsettled by some of the shifts over the last year, and the loss of so many people who shaped our culture.' Departure triggered by dissolution of AGI Readiness team.",
    status: "CONFIRMED",
    tweets: [],
    newsArticles: [
      {
        url: "https://futurism.com/the-byte/openai-safety-researcher-quits-agi",
        title: "Another Safety Researcher Quits OpenAI",
        source: "Futurism",
        publishedAt: new Date("2024-12-05"),
      },
    ],
  },
  {
    personName: "Lilian Weng",
    role: "VP of Research and Safety",
    company: "OPENAI",
    departureDate: new Date("2024-11-15"),
    summary:
      "Left after ~7 years. Created OpenAI's dedicated safety systems team (80+ people) in 2023 after GPT-4 launch. One of the most senior safety-focused departures.",
    status: "CONFIRMED",
    tweets: [
      {
        tweetId: "1855031273690984623",
        url: "https://x.com/lilianweng/status/1855031273690984623",
        text: "After almost 7 years, it's time for me to move on from OpenAI.",
        likes: 12000,
        retweets: 1800,
        replies: 890,
        views: 5500000,
      },
    ],
    newsArticles: [
      {
        url: "https://techcrunch.com/2024/11/08/openai-loses-another-lead-safety-researcher-lilian-weng/",
        title: "OpenAI loses another lead safety researcher, Lilian Weng",
        source: "TechCrunch",
        publishedAt: new Date("2024-11-08"),
      },
    ],
  },
  {
    personName: "Richard Ngo",
    role: "AI Governance Researcher",
    company: "OPENAI",
    departureDate: new Date("2024-11-01"),
    summary:
      "Left saying he had 'a lot of unanswered questions about the events of the last twelve months, which made it harder for me to trust that my work here would benefit the world long-term.' Plans independent research on AI governance.",
    status: "CONFIRMED",
    tweets: [],
    newsArticles: [
      {
        url: "https://www.transformernews.ai/p/richard-ngo-openai-resign-safety",
        title: "Richard Ngo quits OpenAI governance team over safety concerns",
        source: "Transformer News",
        publishedAt: new Date("2024-11-05"),
      },
    ],
  },
  {
    personName: "Steven Adler",
    role: "AI Safety Lead",
    company: "OPENAI",
    departureDate: new Date("2024-11-15"),
    summary:
      "Called the AGI race a 'very risky gamble' and said 'No lab has a solution to AI alignment today. And the faster we race, the less likely anyone finds one in time.' Said he was 'pretty terrified by the pace of AI development.'",
    status: "CONFIRMED",
    tweets: [
      {
        tweetId: "1883928200029602236",
        url: "https://x.com/sjgadler/status/1883928200029602236",
        text: "I left OpenAI. I'm pretty terrified by the pace of AI development.",
        likes: 9500,
        retweets: 2200,
        replies: 750,
        views: 4200000,
      },
    ],
    newsArticles: [
      {
        url: "https://fortune.com/2025/01/28/openai-researcher-steven-adler-quit-ai-labs-taking-risky-gamble-humanity-agi/",
        title: "OpenAI researcher quit saying AI labs are taking a 'risky gamble'",
        source: "Fortune",
        publishedAt: new Date("2025-01-28"),
      },
    ],
  },
  {
    personName: "Carroll Wainwright",
    role: "Superalignment Team Researcher",
    company: "OPENAI",
    departureDate: new Date("2024-06-01"),
    summary:
      "Signed the 'Right to Warn' letter. Publicly stated 'The number of high-level executives that leave OpenAI is not normal. This is a glaring failure of leadership.' His faith in OpenAI's non-profit structure had 'significantly waned.'",
    status: "CONFIRMED",
    tweets: [
      {
        tweetId: "1790627407566967084",
        url: "https://x.com/clwainwright/status/1790627407566967084",
        text: "The number of high-level executives that leave OpenAI is not normal.",
        likes: 4500,
        retweets: 1200,
        replies: 380,
        views: 2800000,
      },
    ],
    newsArticles: [],
  },
  {
    personName: "Ryan Lowe",
    role: "Safety Researcher",
    company: "OPENAI",
    departureDate: new Date("2024-03-15"),
    summary:
      "Left OpenAI from the safety team. Published new research on aligning AI with human values with the Meaning Alignment Institute after departure.",
    status: "CONFIRMED",
    tweets: [
      {
        tweetId: "1773778744173572274",
        url: "https://x.com/ryan_t_lowe/status/1773778744173572274",
        text: "I've left OpenAI. Taking some time to rest and think.",
        likes: 2800,
        retweets: 520,
        replies: 210,
        views: 900000,
      },
    ],
    newsArticles: [],
  },
  {
    personName: "Collin Burns",
    role: "Superalignment Researcher",
    company: "OPENAI",
    departureDate: new Date("2024-07-01"),
    summary:
      "Left as part of the superalignment team exodus after the team was dissolved. Known for weak-to-strong generalization research. Joined Anthropic.",
    status: "CONFIRMED",
    tweets: [],
    newsArticles: [
      {
        url: "https://fortune.com/2024/08/26/openai-agi-safety-researchers-exodus/",
        title: "OpenAI's mass exodus of safety researchers",
        source: "Fortune",
        publishedAt: new Date("2024-08-26"),
      },
    ],
  },
  {
    personName: "Jeffrey Wu",
    role: "Research Engineer, Safety Team",
    company: "OPENAI",
    departureDate: new Date("2024-07-01"),
    summary:
      "Left as part of the superalignment team exodus after 6 years (Aug 2018 - Jul 2024). Joined Anthropic.",
    status: "CONFIRMED",
    tweets: [],
    newsArticles: [],
  },
  {
    personName: "Steven Bills",
    role: "Superalignment Researcher",
    company: "OPENAI",
    departureDate: new Date("2024-07-01"),
    summary:
      "Left as part of superalignment team exodus. Known for interpretability work on neural network explanations. Joined Anthropic.",
    status: "CONFIRMED",
    tweets: [],
    newsArticles: [],
  },
  // Suchir Balaji removed - copyright whistleblower, not safety-related departure
  // ===== GOOGLE / DEEPMIND DEPARTURES =====
  {
    personName: "Geoffrey Hinton",
    role: "VP and Engineering Fellow",
    company: "GOOGLE_DEEPMIND",
    departureDate: new Date("2023-05-01"),
    summary:
      "Resigned from Google to speak freely about AI risks. The 'Godfather of AI' expressed regret over his life's work and warned about existential risks from advanced AI systems.",
    status: "CONFIRMED",
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
    company: "GOOGLE_DEEPMIND",
    departureDate: new Date("2020-12-02"),
    summary:
      "Fired from Google after co-authoring a paper on the risks of large language models. The incident sparked major controversy about research freedom and AI ethics. Founded the DAIR Institute.",
    status: "CONFIRMED",
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
        title: "Google fired its star AI researcher. The fallout continues.",
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
    personName: "Chris Olah",
    role: "Research Scientist (Interpretability)",
    company: "OPENAI",
    departureDate: new Date("2021-02-01"),
    summary:
      "Left to co-found Anthropic as part of the safety-motivated exodus. Pioneer of neural network interpretability and mechanistic interpretability. Now leads interpretability research at Anthropic.",
    status: "CONFIRMED",
    tweets: [],
    newsArticles: [],
  },
  {
    personName: "Margaret Mitchell",
    role: "Co-lead of Ethical AI Team",
    company: "GOOGLE_DEEPMIND",
    departureDate: new Date("2021-02-19"),
    summary:
      "Fired after using automated scripts to search corporate emails for evidence of discrimination against Timnit Gebru. Google claimed 'multiple violations of code of conduct.' She was documenting evidence of mistreatment.",
    status: "CONFIRMED",
    tweets: [],
    newsArticles: [
      {
        url: "https://techcrunch.com/2021/02/19/google-fires-top-ai-ethics-researcher-margaret-mitchell/",
        title: "Google fires top AI ethics researcher Margaret Mitchell",
        source: "TechCrunch",
        publishedAt: new Date("2021-02-19"),
      },
      {
        url: "https://www.theguardian.com/technology/2021/feb/19/google-fires-margaret-mitchell-ai-ethics-team",
        title: "Google fires second AI ethics researcher after she accused it of silencing marginalized voices",
        source: "The Guardian",
        publishedAt: new Date("2021-02-19"),
      },
    ],
  },
  {
    personName: "Samy Bengio",
    role: "Senior Research Director",
    company: "GOOGLE_DEEPMIND",
    departureDate: new Date("2021-04-28"),
    summary:
      "Resigned after ~14 years at Google following the firings of Timnit Gebru and Margaret Mitchell (who reported to him). One of Google Brain co-founders. Later joined Apple.",
    status: "CONFIRMED",
    tweets: [],
    newsArticles: [
      {
        url: "https://fortune.com/2021/04/06/google-ai-research-manager-quits-after-two-ousted/",
        title: "Google AI research manager quits after two colleagues were ousted",
        source: "Fortune",
        publishedAt: new Date("2021-04-06"),
      },
    ],
  },
  {
    personName: "Alex Hanna",
    role: "AI Ethics Researcher",
    company: "GOOGLE_DEEPMIND",
    departureDate: new Date("2022-02-01"),
    summary:
      "Resigned after managers Timnit Gebru and Margaret Mitchell were fired. Pointed out how 'tech organizations embody white supremacist values and practices.' Joined Gebru's DAIR Institute as Director of Research.",
    status: "CONFIRMED",
    tweets: [],
    newsArticles: [
      {
        url: "https://www.technologyreview.com/2022/10/19/1061075/alex-hanna-google-ai-research/",
        title: "Why Alex Hanna left Google AI research",
        source: "MIT Technology Review",
        publishedAt: new Date("2022-10-19"),
      },
    ],
  },
  {
    personName: "Dylan Baker",
    role: "Software Engineer, Ethical AI",
    company: "GOOGLE_DEEPMIND",
    departureDate: new Date("2022-02-01"),
    summary:
      "Resigned alongside Alex Hanna. Said the firings of Gebru and Mitchell 'weighed heavily' on him. Joined Gebru's DAIR Institute.",
    status: "CONFIRMED",
    tweets: [],
    newsArticles: [
      {
        url: "https://www.bloomberg.com/news/articles/2022-02-02/google-loses-two-ethical-ai-staffers-to-timnit-gebru-s-institute",
        title: "Google loses two ethical AI staffers to Timnit Gebru's institute",
        source: "Bloomberg",
        publishedAt: new Date("2022-02-02"),
      },
    ],
  },
  // ===== ANTHROPIC DEPARTURES =====
  {
    personName: "Mrinank Sharma",
    role: "Head of Safeguards Research Team",
    company: "ANTHROPIC",
    departureDate: new Date("2026-02-09"),
    summary:
      "Published a reflective resignation letter on X. Expressed broad disillusionment, stating he 'repeatedly seen how hard it is to truly let our values govern our actions.' Said 'the world is in peril' from interconnected crises. Plans to pursue poetry.",
    status: "CONFIRMED",
    tweets: [
      {
        tweetId: "2020881722003583421",
        url: "https://x.com/MrinankSharma/status/2020881722003583421",
        text: "I've decided to leave Anthropic. The world is in peril.",
        likes: 18000,
        retweets: 4500,
        replies: 2100,
        views: 4300000,
      },
    ],
    newsArticles: [
      {
        url: "https://gizmodo.com/anthropic-ai-safety-researcher-mrinank-sharm-resigns-2000719865",
        title: "Anthropic Safety Researcher's Vague Resignation Isn't Reassuring",
        source: "Gizmodo",
        publishedAt: new Date("2026-02-10"),
      },
      {
        url: "https://the-decoder.com/anthropics-head-of-safeguards-research-warns-of-declining-company-values-on-departure/",
        title: "Anthropic's head of Safeguards Research warns of declining company values on departure",
        source: "The Decoder",
        publishedAt: new Date("2026-02-10"),
      },
      {
        url: "https://www.benzinga.com/markets/tech/26/02/50501947/anthropics-ai-safety-head-just-resigned-he-says-the-world-is-in-peril",
        title: "Anthropic's AI Safety Head Just Resigned. He Says 'The World Is In Peril'",
        source: "Benzinga",
        publishedAt: new Date("2026-02-10"),
      },
      {
        url: "https://www.eweek.com/news/ai-safety-leader-resigns-anthropic-global-risks/",
        title: "Anthropic Safety Leader Resigns, Warns 'the World Is in Peril'",
        source: "eWeek",
        publishedAt: new Date("2026-02-10"),
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
      `  Created: ${departure.personName} (${d.company}) - score: ${score.toFixed(1)}`
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
