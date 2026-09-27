import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type TutorialHeading = {
  text: string;
  slug: string;
};

export type Tutorial = {
  slug: string;
  title: string;
  language: string;
  description: string;
  headings: TutorialHeading[];
  filePath: string;
};

const tutorialsDirectory = path.join(
  process.cwd(),
  "src",
  "content",
  "tutorials"
);

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function extractHeadings(content: string): TutorialHeading[] {
  const headings: TutorialHeading[] = [];

  const regex = /^##\s+(.+)$/gm;

  let match;

  while ((match = regex.exec(content)) !== null) {
    const text = match[1].trim();

    headings.push({
      text,
      slug: slugify(text),
    });
  }

  return headings;
}

export function getTutorials(language: string): Tutorial[] {
  const languageDirectory = path.join(
    tutorialsDirectory,
    language
  );

  if (!fs.existsSync(languageDirectory)) {
    return [];
  }

  const files = fs
    .readdirSync(languageDirectory)
    .filter((file) => file.endsWith(".mdx"));

  return files.map((file) => {
    const filePath = path.join(languageDirectory, file);

    const source = fs.readFileSync(filePath, "utf8");

    const parsed = matter(source);

    const slug = file.replace(/\.mdx$/, "");

    return {
      slug,
      title:
        parsed.data.title ||
        slug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (char: string) =>
            char.toUpperCase()
          ),
      language:
        parsed.data.language ||
        language,
      description:
        parsed.data.description ||
        "",
      headings: extractHeadings(parsed.content),
      filePath,
    };
  });
}

export function getTutorial(
  language: string,
  slug: string
): Tutorial | undefined {
  const tutorials = getTutorials(language);

  return tutorials.find(
    (tutorial) => tutorial.slug === slug
  );
}

export function getAllLanguages(): string[] {
  if (!fs.existsSync(tutorialsDirectory)) {
    return [];
  }

  return fs
    .readdirSync(tutorialsDirectory, {
      withFileTypes: true,
    })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);
}