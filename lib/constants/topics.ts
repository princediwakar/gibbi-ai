// Path: lib/constants/topics.ts
// Seed taxonomy for common exam domains. Used as guidance, not a constraint.
// The AI can output skill_domain values outside this list — the UI dynamically
// groups whatever values the AI produces.

export const TOPIC_TAXONOMY: Record<string, string[]> = {
  Physics: [
    "Mechanics", "Thermodynamics", "Electromagnetism", "Optics",
    "Quantum Mechanics", "Nuclear Physics", "Relativity", "Waves",
    "Fluid Dynamics", "Kinematics", "Gravitation", "Oscillations",
  ],
  Chemistry: [
    "Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry",
    "Biochemistry", "Analytical Chemistry", "Thermochemistry",
    "Chemical Bonding", "Periodic Table", "Stoichiometry",
    "Chemical Equilibrium", "Acids and Bases", "Redox Reactions",
  ],
  Biology: [
    "Cell Biology", "Genetics", "Evolution", "Ecology",
    "Human Anatomy", "Physiology", "Microbiology", "Botany",
    "Zoology", "Molecular Biology", "Immunology", "Neuroscience",
  ],
  Mathematics: [
    "Algebra", "Geometry", "Trigonometry", "Calculus",
    "Linear Algebra", "Probability", "Statistics", "Number Theory",
    "Differential Equations", "Combinatorics", "Set Theory", "Logic",
  ],
  "Computer Science": [
    "Algorithms", "Data Structures", "Operating Systems",
    "Computer Networks", "Database Systems", "Software Engineering",
    "Artificial Intelligence", "Machine Learning", "Cybersecurity",
    "Programming Languages", "Compiler Design", "Computer Architecture",
  ],
  Economics: [
    "Microeconomics", "Macroeconomics", "International Trade",
    "Development Economics", "Econometrics", "Game Theory",
    "Public Economics", "Monetary Policy", "Fiscal Policy",
  ],
  History: [
    "Ancient History", "Medieval History", "Modern History",
    "World War I", "World War II", "Cold War",
    "Colonialism", "Industrial Revolution", "Renaissance",
  ],
  English: [
    "Grammar", "Vocabulary", "Reading Comprehension",
    "Writing", "Literature", "Poetry", "Essay Structure",
  ],
};

export function buildTaxonomyMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const [subject, domains] of Object.entries(TOPIC_TAXONOMY)) {
    for (const domain of domains) {
      const key = domain.toLowerCase().trim();
      map.set(key, domain);
    }
  }
  return map;
}
