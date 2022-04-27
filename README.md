
# D3 GRAPH PROJECT

Project to draw a d3 graph.
   - drag and drop + zoom + click + svg images customized...
   - Algorithm implemented to draw nodes in the best positions


## Tech Stack

**Language:** Javascript

**graphic library:** D3


## Authors

- [@Zaquiel Rodriguez Arce (Linkedin)](https://www.linkedin.com/in/zaquiel-rodriguez-arce-728bb9141)


## Demo

https://zaquielverse-d3-graph.herokuapp.com/


## 🚀 About Me
I'm a frontend developer. I have been working most of the time with React (classes and hooks), Redux. Furthemore, I have worked also in some projects with Angular. I am always exciting to do new projects and I dedicate time every week to learn other technologies to improve my skills


## Usage

```javascript
import Graph from 'zaquielverse-d3-graph/lib/Graph';
import './App.css';

const localNodes = [
  {
    id: 1,
    image: 'proceso',
    originalName: 'process1',
    secondLabel: 'Second name',
  },
  {
    id: 2,
    image: 'proceso',
    originalName: 'node2'
  }
];
const localLinks = [
  {
    source: 1,
    target: 2
  }];

function App() {
  return (
    <div>
      <Graph
        links={localLinks}
        nodes={localNodes}
      />
    </div>
  );
}

export default App;
```

Note: Images should be in public/images (they should be in PNG format)

Example: https://github.com/zaquielverse/random-tutorials/tree/master/my-npm-package

