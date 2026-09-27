import fs from "fs";
import { MDXRemote } from "next-mdx-remote/rsc";
import matter from "gray-matter";
import rehypeSlug from "rehype-slug";
import rehypePrism from "rehype-prism-plus";

import TutorialLayout from "../../../components/TutorialLayout";
import CodeBlock from "../../../components/CodeBlock";

import {
  getTutorial,
  getTutorials,
  getAllLanguages,
} from "../../../../src/lib/tutorials";

type PageProps = {
  params: Promise<{
    language: string;
    tutorial: string;
  }>;
};

export async function generateStaticParams() {
  const languages = getAllLanguages();

  const paths = [];

  for (const language of languages) {
    const tutorials = getTutorials(language);

    for (const tutorial of tutorials) {
      paths.push({
        language,
        tutorial: tutorial.slug,
      });
    }
  }

  return paths;
}

export default async function TutorialPage({
  params,
}: PageProps) {
  const { language, tutorial: tutorialSlug } = await params;

  const tutorial = getTutorial(
    language,
    tutorialSlug
  );

  if (!tutorial) {
    return (
      <div style={{ padding: "60px" }}>
        <h1>Tutorial not found</h1>
        <p>
          The tutorial <strong>{tutorialSlug}</strong> does not exist.
        </p>
      </div>
    );
  }

  const tutorials = getTutorials(language);

  const source = fs.readFileSync(
    tutorial.filePath,
    "utf8"
  );

  const { content } = matter(source);

  return (
    <TutorialLayout
      tutorial={tutorial}
      tutorials={tutorials}
    >
      <MDXRemote
        source={content}
        components={{
          pre: CodeBlock,
        }}
        options={{
          mdxOptions: {
            rehypePlugins: [
              rehypeSlug,
              [rehypePrism, { showLineNumbers: true }],
            ],
          },
        }}
      />
    </TutorialLayout>
  );
}