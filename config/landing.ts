import { FeatureLdg, InfoLdg, TestimonialType } from "@/types";

export const infos: InfoLdg[] = [
  {
    title: "Stop Studying What You Already Know",
    description:
      "GibbiAI finds the gaps in your knowledge—so you walk in confident, not confused.",
    image: "/_static/illustrations/feature.png",
    list: [
      {
        title: "\"I don't know what I don't know\"",
        description: "After every test, see exactly where you slipped—and study that, not everything.",
        icon: "search",
      },
      {
        icon: "clock",
        title: "\"I run out of time on exams\"",
        description: "Timed practice mode builds your pace. No more rushing on the real thing.",
      },
      {
        icon: "brain",
        title: "\"I forget everything by exam day\"",
        description: "Instant explanations after every answer = deeper retention, longer memory.",
      },
    ],
  },
  {
    title: "Your Exam-Ready in 3 Steps",
    description:
      "From messy notes to focused practice in seconds. No setup required.",
    image: "/_static/illustrations/feature.png",
    list: [
      {
        title: "1. Paste your material",
        description: "Notes, textbook chapters, or upload a PDF. Anything goes.",
        icon: "fileText",
      },
      {
        title: "2. Take the test",
        description: "Timed practice. Real exam conditions. No distractions.",
        icon: "check",
      },
      {
        title: "3. See your weak spots",
        description: "Every wrong answer explained. Know exactly what to review next.",
        icon: "search",
      },
    ],
  },
];

// @/config/landing.ts
export const features: FeatureLdg[] = [
  {
    title: "AI-Powered Quiz Creation",
    description: "Generate tailored quizzes in seconds with our advanced AI, adapting to your subject and difficulty preferences.",
    icon: "cpu",
  },
  {
    title: "Real-Time Customization",
    description: "Edit questions, options, and answers on the fly with an intuitive interface—no delays, just results.",
    icon: "edit",
  },
  {
    title: "Seamless Exports",
    description: "Download quizzes as PDF or Excel files for offline use, perfect for classrooms or study groups.",
    icon: "download",
  },
  {
    title: "Instant Sharing",
    description: "Share quizzes via unique links or embeds, making collaboration effortless for teams and students.",
    icon: "share",
  },
  {
    title: "Performance Insights",
    description: "Track scores and progress with detailed analytics to identify strengths and areas for improvement.",
    icon: "chartBar",
  },
  {
    title: "Adaptive Learning",
    description: "Personalize quiz difficulty and content dynamically based on user performance for optimal growth.",
    icon: "user",
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
      "I love how I can create quizzes on various topics quickly. It's a great way to engage my audience and gather feedback on my writing.",
    location: "Milan, Italy",
  },
];




export const studentTestimonials: TestimonialType[] = [
  {
    name: "Ethan Rivera",
    job: "College Freshman",
    image: "https://randomuser.me/api/portraits/men/15.jpg",
    review:
      "Exams used to stress me out so bad, but GibbiAI lets me tweak the quizzes to match my pace. The timed tests? Total game-changer for my prep.",
    location: "North Carolina, USA",
  },
  {
    name: "Luna Ortiz",
    job: "University Sophomore",
    image: "https://randomuser.me/api/portraits/women/18.jpg",
    review:
      "I love seeing where I'm at with the results breakdown. It's like, 'Oh, I nailed this, but I gotta work on that.' Keeps me on track without the overwhelm.",
    location: "Mexico City, Mexico",
  },
  {
    name: "Anthony Davis",
    job: "Coding Bootcamp Student",
    image: "https://randomuser.me/api/portraits/men/28.jpg",
    review:
      "Learning code was brutal until I started quizzing myself with GibbiAI. The questions push me just right, and I'm finally getting the hang of it.",
    location: "San Diego, US",
  },
  {
    name: "Lena Dubois",
    job: "University Senior",
    image: "https://randomuser.me/api/portraits/women/30.jpg",
    review:
      "Cramming wasn't working, so I tried GibbiAI's timed quizzes. Now I'm way less panicked for exams—feels like I've got this under control.",
    location: "Paris, France",
  },
  {
    name: "Jasper Silva",
    job: "High School Sophomore",
    image: "https://randomuser.me/api/portraits/men/33.jpg",
    review:
      "I was drowning in bio homework, but GibbiAI made it chill. I quiz myself on the bus with the offline exports—super easy and I'm actually learning!",
    location: "São Paulo, Brazil",
  },
  {
    name: "Emma Johnson",
    job: "High School Senior",
    image: "https://randomuser.me/api/portraits/women/35.jpg",
    review:
      "GibbiAI has been a lifesaver for my AP classes. I can create quizzes from my notes in minutes and track my progress effortlessly.",
    location: "Chicago, USA",
  },
  {
    name: "Maya Patel",
    job: "High School Junior",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
    review:
      "I was freaking out about finals, but GibbiAI saved me! I turned my messy notes into quizzes in like two seconds, and now I actually feel ready.",
    location: "Mumbai, India",
  },
  {
    name: "Sophia Müller",
    job: "University Junior",
    image: "https://randomuser.me/api/portraits/women/37.jpg",
    review:
      "I love how GibbiAI helps me focus on my weak areas. The detailed results are incredibly helpful for improving my grades.",
    location: "Berlin, Germany",
  },
  {
    name: "Oliver Brown",
    job: "High School Junior",
    image: "https://randomuser.me/api/portraits/men/38.jpg",
    review:
      "GibbiAI makes studying fun and efficient. I can create quizzes on any topic and share them with my friends for group study sessions.",
    location: "London, UK",
  },
];
