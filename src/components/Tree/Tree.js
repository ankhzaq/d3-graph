import * as d3 from 'd3';
import { useEffect } from 'react';

const TREE_DATA = {
  name: "Top Level",
  children: [
    {
      name: 'Level 2: A',
      children: [
        {
          name: 'Son of A',
        },
        {
          name: 'Daughter of A'
        }
      ]
    },
    {
      name: 'Level 2: B'
    }
  ]
}

let svg = d3
  .select(".containerTree");
let i = 0;
let duration = 750;
let root;

const margin = { top: 20, right: 90, bottom: 20, left: 90 }
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

let treeMap = d3.tree().size([height, width]);
root = d3.hierarchy(TREE_DATA, function(d) {
  return d.children;
});
root.x0 = height / 2;
root.y0 = 0;


function update(source) {
  const treeData = treeMap(root);

  // nodes
  let nodes = treeData.descendants();
  nodes.forEach(function(d) {
    d.y = d.depth * 180;
  });
  const node = svg.selectAll('g.node').data(nodes, function(d) {
    return d.id || (d.i = ++i);
  });

  let nodeEnter = node.enter().append('g').attr('class', 'node'). attr('transform', function(d) {
    return "translate(" + source.y0 + ", " + source.x0 + ")";
  })
    .on('click', click);

  nodeEnter.append('circle').attr('class', 'node').attr('r', 0).style('fill', function(d) {
    return d._children ? "red" : "black";
  })

  let nodeUpdate = nodeEnter.merge(node);

  nodeUpdate
    .transition()
    .duration(duration)
    .attr('transform', function(d) {
      return 'translate(' + d.y + ', ' + d.x + ')';
    });

  nodeUpdate
    .select('circle.node')
    .attr('r', 10)
    .style('fill', function(d) { return d._children ? 'red' : 'black'})
    .attr('cursor', 'pointer');

  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  })
}

function click(event, d) {
  if (d.children) {
    d._children = d.children
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d)
}

const Tree = () => {
  useEffect(() => {
    svg = d3
      .select(".containerTree")
      .append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr('transform', "translate(" + margin.left + ',' + margin.top + ")");
    update(root);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%'}} className="containerTree">

    </div>
  );
}
export default Tree;
