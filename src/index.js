import "./style.css";

document.body.innerHTML = `
  <h1>Hello Webpack!</h1>
  <p>Project is running successfully.</p>
  <button id="btn">Click me</button>
`;

document.getElementById('btn').addEventListener('click', () => {
  alert('Button clicked!');
});
