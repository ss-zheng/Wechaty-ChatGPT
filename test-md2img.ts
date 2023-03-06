import markdownIt from 'markdown-it';
import fs from 'fs';
import nodeHtmlToImage from 'node-html-to-image';


function convertMarkdownToHtml(markdown: string): string {
    const md = new markdownIt();
    return md.render(markdown);
}

const markdownFilePath = 'example.md';
const markdownString = fs.readFileSync(markdownFilePath, 'utf-8');
const html = convertMarkdownToHtml(markdownString)


nodeHtmlToImage({
  output: './image.png',
  html: html
})
  .then(() => console.log('The image was created successfully!'))