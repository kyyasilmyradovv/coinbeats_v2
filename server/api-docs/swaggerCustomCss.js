module.exports = `
  body {
    background-color: #282c34;
    color:rgb(243, 242, 242);
  }

  .swagger-ui textarea {
   background-color: rgb(30, 28, 28);
  }

  .swagger-ui .topbar {
    display: none;
    color: white;
  }
  
  .swagger-ui .btn {
    background-color: #3a3f47;
    color: #fff !important;
    border-color: #3a3f47;
  }

  .swagger-ui .scheme-container,
  .swagger-ui input[type=file] {
    background-color: #3a3f47;
  } 
  
  /* Force all elements within swagger-ui to white text */
  body .swagger-ui * {
    color:rgb(243, 242, 242) !important;
  }

  .swagger-ui select,
  .swagger-ui .parameters-col_description input, 
  .swagger-ui .opblock .opblock-section-header,
  .swagger-ui .parameters-col_description select,
  .swagger-ui .dialog-ux .modal-ux,
  .swagger-ui .auth-container input[type=text]
  {
    background: #282c34;
  }

  .swagger-ui .opblock-control-arrow, 
  .swagger-ui .authorization__btn .unlocked,
  .swagger-ui svg:not(:root),
  .swagger-ui .authorization__btn .locked
  {
    fill:rgb(243, 242, 242);
    opacity: .6;
  } 

  .swagger-ui .scheme-container  {
    background: #282c34;
    padding: 0;
    margin: 0;
    position: absolute;
    top: 80px;
    right: 30px;
  }
`;
