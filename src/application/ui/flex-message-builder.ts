export interface FlexBubble {
  type: 'bubble';
  body: Record<string, unknown>;
  footer?: Record<string, unknown>;
}

export interface FlexMessage {
  type: 'flex';
  altText: string;
  contents: FlexBubble;
}

export const buildSimpleFlexMessage = (
  title: string,
  description: string
): FlexMessage => ({
  type: 'flex',
  altText: title,
  contents: {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: title,
          weight: 'bold',
          size: 'lg',
        },
        {
          type: 'text',
          text: description,
          wrap: true,
          margin: 'md',
        },
      ],
    },
  },
});
