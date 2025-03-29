import { FeatureLdg, InfoLdg, TestimonialType } from "@/types";

export const infos: InfoLdg[] = [
  {
    title: "Create Quizzes Effortlessly",
    description:
      "With GibbiAI, you can generate quizzes in seconds. Just provide a topic or paste text, and our AI will create engaging questions for you.",
    image: "/_static/illustrations/work-from-home.jpg", // Update the image path
    list: [
      {
        title: "AI-Powered",
        description: "Leverage AI to generate quizzes instantly.",
        icon: "brain",
      },
      {
        title: "Customizable",
        description: "Tailor quizzes to your specific needs.",
        icon: "settings",
      },
      {
        title: "Shareable",
        description: "Easily share quizzes with your audience.",
        icon: "share",
      },
    ],
  },
  {
    title: "Track and Analyze Quiz Performance",
    description:
      "Get detailed analytics on quiz attempts, scores, and engagement. Use these insights to improve your quizzes and better understand your audience.",
    image: "/_static/illustrations/work-from-home.jpg", // Update the image path
    list: [
      {
        title: "Data-Driven",
        description: "Access comprehensive quiz analytics.",
        icon: "chartBar",
      },
      {
        title: "Insightful",
        description: "Understand user performance and engagement.",
        icon: "search",
      },
      {
        title: "Actionable",
        description: "Use insights to improve your quizzes.",
        icon: "arrowRight",
      },
    ],
  },
];


export const features: FeatureLdg[] = [
  {
    title: "AI-Powered Quiz Generation",
    description:
      "Generate quizzes effortlessly by simply providing a topic or prompt. Our AI handles the rest, creating engaging questions tailored to your needs.",
    icon: 'brain',
  },
  {
    title: "Customizable Difficulty Levels",
    description:
      "Choose from easy, medium, or hard levels to tailor quizzes for different audiences, ensuring an optimal learning experience.",
    icon: 'star',
  },
  {
    title: "Data & Analytics",
    description:
      "Track quiz attempts, scores, and engagement metrics to understand user performance and improve your quizzes over time.",
    icon: 'chartBar',
  },
  {
    title: "Shareable & Embeddable Quizzes",
    description:
      "Easily share quizzes via links or embed them on your website or blog to reach a wider audience.",
    icon: 'share',
  },
  {
    title: "Multi-Industry Applications",
    description:
      "Utilize quizzes for education, training, marketing, and more, making them a versatile tool for various sectors.",
    icon: 'briefcase',
  },
  {
    title: "Downloadable Quizzes",
    description:
      "Easily download your quizzes in PDF or Excel formats for offline use or sharing with others.",
    icon: 'download',
  },
];

export const testimonials: TestimonialType[] = [
  {
    name: "Sofia Rossi",
    job: "High School Teacher",
    image: "https://randomuser.me/api/portraits/women/1.jpg", // New image for USA
    review:
      "Using this quiz app has made it so easy to create engaging quizzes for my students. The AI-generated questions are spot on, and my students love the interactive format!",
    location: "New York, USA",
  },
  {
    name: "Liam O'Connor",
    job: "College Student",
    image: "https://randomuser.me/api/portraits/men/2.jpg", // New image for Canada
    review:
      "I appreciate how I can customize the difficulty levels of the quizzes. It really helps me prepare for exams in a way that suits my learning style.",
    location: "Toronto, Canada",
  },
  {
    name: "Emily Green",
    job: "Corporate Trainer",
    image: "https://randomuser.me/api/portraits/women/3.jpg", // New image for UK
    review:
      "The analytics feature is fantastic! I can track my team's progress and see where they need improvement. This tool has been a game changer for our training sessions.",
    location: "London, UK",
  },
  {
    name: "Oliver Brown",
    job: "Marketing Manager",
    image: "https://randomuser.me/api/portraits/men/8.jpg", // New image for Australia
    review:
      "Creating quizzes for lead generation has never been easier. The ability to download quizzes in PDF and Excel formats is a huge plus for our marketing campaigns.",
    location: "Sydney, Australia",
  },
  {
    name: "Amina Khan",
    job: "Educational Consultant",
    image: "https://randomuser.me/api/portraits/women/6.jpg", // New image for South Africa
    review:
      "As an educational consultant, I recommend this quiz app to all my clients. The ease of use and the quality of the quizzes generated are impressive. It saves so much time!",
    location: "Cape Town, South Africa",
  },
  {
    name: "Hiroshi Tanaka",
    job: "Software Developer",
    image: "https://randomuser.me/api/portraits/men/4.jpg", // New image for Singapore
    review:
      "I used this app to create quizzes for a coding bootcamp. The questions were relevant and challenging, and the students found them very helpful for their learning.",
    location: "Singapore",
  },
  {
    name: "Anna Müller",
    job: "HR Manager",
    image: "https://randomuser.me/api/portraits/women/5.jpg", // New image for Germany
    review:
      "We implemented this quiz tool for our onboarding process. It has made training new employees much more engaging and effective. Highly recommend!",
    location: "Berlin, Germany",
  },
  {
    name: "Michael Green",
    job: "Freelance Writer",
    image: "https://randomuser.me/api/portraits/men/6.jpg", // Keeping this name as it is
    review:
      "I love how I can create quizzes on various topics quickly. It’s a great way to engage my audience and gather feedback on my writing.",
    location: "Milan, Italy",
  },
];