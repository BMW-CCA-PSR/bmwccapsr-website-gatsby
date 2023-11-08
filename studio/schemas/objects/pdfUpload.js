export default {
    name: 'pdfUpload',
    title: 'PDF Upload',
    type: 'document',
    fields: [
      {
        name: 'title',
        title: 'Title',
        type: 'string',
      },
      {
        name: 'pdfFile',
        title: 'PDF File',
        type: 'file',
        options: {
          accept: '.pdf',
        },
      },
    ],
  };
  