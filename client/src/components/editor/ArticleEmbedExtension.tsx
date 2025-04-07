import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { Article } from '@shared/schema';
import React from 'react';
import ArticleEmbed from './ArticleEmbed';

interface ArticleEmbedOptions {
  HTMLAttributes: Record<string, any>;
}

interface ArticleEmbedAttrs {
  articleId: number | null;
  articleSlug: string | null;
  articleTitle: string | null;
  articleImageUrl: string | null;
  articleExcerpt: string | null;
  articleCreatedAt: string | null;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    articleEmbed: {
      setArticleEmbed: (attrs: Partial<ArticleEmbedAttrs>) => ReturnType;
    };
  }
}

const ArticleEmbedNode = Node.create<ArticleEmbedOptions>({
  name: 'articleEmbed',
  group: 'block',
  atom: true, // Ne peut pas être divisé
  draggable: true,

  addAttributes() {
    return {
      articleId: {
        default: null,
      },
      articleSlug: {
        default: null,
      },
      articleTitle: {
        default: null,
      },
      articleImageUrl: {
        default: null,
      },
      articleExcerpt: {
        default: null,
      },
      articleCreatedAt: {
        default: null,
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="article-embed"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'article-embed',
        'data-article-id': HTMLAttributes.articleId,
        'data-article-slug': HTMLAttributes.articleSlug,
      }),
      '',
    ];
  },

  addCommands() {
    return {
      setArticleEmbed: (attrs) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs,
          })
          .run();
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer((props) => {
      const { node } = props;

      const articleData: Partial<Article> = {
        id: node.attrs.articleId,
        slug: node.attrs.articleSlug,
        title: node.attrs.articleTitle,
        imageUrl: node.attrs.articleImageUrl,
        excerpt: node.attrs.articleExcerpt,
        createdAt: node.attrs.articleCreatedAt,
      };

      return (
        <NodeViewWrapper>
          <div contentEditable={false} style={{ userSelect: 'none' }}>
            <ArticleEmbed article={articleData} />
          </div>
        </NodeViewWrapper>
      );
    });
  },
});

export default ArticleEmbedNode;