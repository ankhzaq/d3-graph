
import React, { useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';

import arrayShuffle from 'array-shuffle';

import * as propTypes from 'prop-types';
import * as d3 from 'd3';

const { SubMenu } = Menu;
const { Content, Sider } = Layout;

let firstRender = true;

const WIDTH = 1500;
const HEIGHT = 1000;
const WIDTH_ICON = 60;
const SIZE_NODE_X = 200;
const SIZE_NODE_Y = 100;
const SMALL_DEVIATION = WIDTH_ICON * 3;

const lines_init = [
  { "source": 0, "target": 1 },
  { "source": 1, "target": 2 },
  { "source": 2, "target": 5 },
  { "source": 5, "target": 4 },
  { "source": 3, "target": 1 },
  { "source": 7, "target": 8 },
  { "source": 9, "target": 8 },
  { "source": 6, "target": 1 },
];

const nodes_init = [
  {"id": "Uno", text: "uno1", text2: "uno2"},
  {"id": "Dos", text: "dos1", text2: "dos2"},
  {"id": "tres", text: "tres1", text2: "tres2"},
  {"id": "cuatro", text: "cuatro1", text2: "cuatro2"},
  {"id": "cinco", text: "cinco1", text2: "cinco2"},
  {"id": "seis", text: "seis1", text2: "seis2"},
  {"id": "siete", text: "siete1", text2: "siete2"},
  {"id": "ocho", text: "ocho1", text2: "ocho2"},
  {"id": "nueve", text: "nueve1", text2: "nueve2"},
  {"id": "diez", text: "diez1", text2: "diez2"},
];

let showHideNodes = false;

let countClicks = 0;
let dragInteraction = null;

let localState = {};

let previousNodes = [];

let simulation = null;

let newNodesCollapsedState = {};

let listGraph = []

let zoom = null;

let menu = [];

let nodeClicked = null;

let stateChanged = true;

function getNodesPos(nodes) {
  const nodesPos = {};
  nodes.forEach((node, posNode) => {
    nodesPos[node.id] = posNode;
  });
  return nodesPos;
}

function positionOcuppied(currentPositions, newPos) {
  const nodesDrawed = Object.keys(currentPositions);
  return nodesDrawed.some((nodeId) => {
    const node = JSON.parse(JSON.stringify(currentPositions[nodeId]));
    return (newPos.x > (node.x - SIZE_NODE_X) && newPos.x < (node.x + SIZE_NODE_X) && newPos.y > (node.y - SIZE_NODE_Y) && newPos.y < (node.y + SIZE_NODE_Y));
  })
}

function addInclination(currentPositions, newPos) {
  const nodesDrawed = Object.keys(currentPositions);
  const newPosition = { ...newPos };

  let inclinationFounded = false;
  let iteration = 1;
  while (!inclinationFounded) {
    const newYUP = newPos.y + (SIZE_NODE_Y * iteration);
    const newYDOWN = newPos.y - (SIZE_NODE_Y * iteration);
    const inclinationY = 100;
    const newXLEFT = newPos.x - (SIZE_NODE_X * iteration);
    const newXRIGHT = newPos.x + (SIZE_NODE_X * iteration);
    const existUPInclination = nodesDrawed.some((nodeId) => {
      const node = currentPositions[nodeId];
      return (node.y === newYUP)
    });
    const existDOWNInclination = nodesDrawed.some((nodeId) => {
      const node = currentPositions[nodeId];
      return (node.y === newYDOWN)
    });
    const existLEFTUPInclination = nodesDrawed.some((nodeId) => {
      const node = currentPositions[nodeId];
      return (node.x === newXLEFT && node.y === newPosition.y + inclinationY)
    });
    const existLEFTDOWNInclination = nodesDrawed.some((nodeId) => {
      const node = currentPositions[nodeId];
      return (node.x === newXLEFT && node.y === newPosition.y - inclinationY)
    });
    const existRIGHTUPInclination = nodesDrawed.some((nodeId) => {
      const node = currentPositions[nodeId];
      return (node.x === newXRIGHT && node.y === newPosition.y + inclinationY)
    });
    const existRIGHTDOWNInclination = nodesDrawed.some((nodeId) => {
      const node = currentPositions[nodeId];
      return (node.x === newXRIGHT && node.y === newPosition.y - inclinationY)
    });

    const conditionals = {
      left: {
        condition: (!existLEFTUPInclination || !existLEFTDOWNInclination),
        func: () => {
          const newY = existLEFTUPInclination ? newPosition.y + inclinationY : newPosition.y - inclinationY
          const placeAvailable = !positionOcuppied(currentPositions, { x: newXLEFT, y: newY });
          if (placeAvailable) {
            inclinationFounded = true;
            newPosition.x = newXLEFT;
            newPosition.y = newPosition.y;
          }
        }
      },
      right: {
        condition: (!existRIGHTUPInclination || !existRIGHTDOWNInclination),
        func: () => {
          const newY = existRIGHTUPInclination ? newPosition.y + inclinationY : newPosition.y - inclinationY
          const placeAvailable = !positionOcuppied(currentPositions, { x: newXLEFT, y: newY });
          if (placeAvailable) {
            inclinationFounded = true;
            newPosition.x = newXRIGHT;
            newPosition.y = newPosition.y;
          }
        }
      },
      upDown: {
        condition: !existUPInclination || !existDOWNInclination,
        func: () => {
          const newY = !existUPInclination ? newYUP : newYDOWN;
          const randomBoolean = Math.random() < 0.5;
          const lightInclination = SIZE_NODE_X / 4;
          const newX = randomBoolean ? newPosition.x + lightInclination : newPosition.x - lightInclination;
          const placeAvailable = !positionOcuppied(currentPositions, { x: newX, y: newY});
          if (placeAvailable) {
            inclinationFounded = true;
            newPosition.x = newX;
            newPosition.y = newY;
          }
        }
      }
    }
    const listConditionalsRandomOrder = arrayShuffle(Object.keys(conditionals));
    let conditionApplied = false;
    listConditionalsRandomOrder.forEach((conditionKey) => {
      if (!conditionApplied) {
        const conditional = conditionals[conditionKey];
        if (conditional.condition) {
          conditionApplied = true;
          conditional.func();
        }
      }
    });
    iteration += 1;
  }
  return newPosition;
}

function getMenuFromtListGraph(element) {
  if (element.children.length) {
    return(<SubMenu key={element.id} title={element.originalName}>
      {element.children.map((elementChild) => getMenuFromtListGraph(elementChild))}
    </SubMenu>)
  }
  return (<Menu.Item key={element.id}>{element.originalName}</Menu.Item>);
}

function Graph({ dateUpdated, links: linksProps, getResetGraph, images, nodes: nodesProps, onClick, onDoubleClick, showListGraph, width, height }) {
  const [resetGraph, setResetGraph] = useState(false);
  const [state, setState] = useState({ nodes: nodesProps, lines: linksProps, nodesPos: getNodesPos(nodesProps) });

  const addChildToListGraph = (elem, parents, child, listResponses = []) => {
    if (!elem.children.length) {
      if (parents.includes(elem.id)) {
        elem.children.push({ ...child, children: [] });
      }
      listResponses.push(elem.id);
      return listResponses;
    }
    if (parents.includes(elem.id)) {
      const exist = elem.children.some((elemChild) => elemChild.id === child.id);
      if (!exist) elem.children.push({ ...child, children: [] });
      listResponses.push(elem.id);
      return listResponses;
    }
    elem.children.forEach((childElem) => {
      return addChildToListGraph(childElem, parents, child, listResponses);
    })
  }

  const initializeListOfGraph = () => {
    const { lines, nodes, nodesPos } = state;

    listGraph = [];

    const nodesWithoutParent = nodes.filter((node) => !lines.some((line) => line.target === node.id));

    const nodesToCheck = [];
    let nodesVisited = [];
    nodesWithoutParent.forEach((node) => {
      if (!nodesToCheck.includes(node.id)) {
        nodesToCheck.push(node.id);
        listGraph.push({ ...node, children: [] });
      }
    });

    while(nodesToCheck.length) {
      const nodeChecked = nodesToCheck.shift();
      const nodesIdChildren = lines.filter((line) => line.source === nodeChecked).map((line) => line.target);
      nodesIdChildren.forEach((nodeIdChild) => {
        const child = nodes.find((node) => node.id === nodeIdChild);
        const parents = lines.filter((line) => line.target === nodeIdChild).map((line) => line.source);
        listGraph.forEach((nodeListGraph) => {
          addChildToListGraph(nodeListGraph, parents, child);
        });
        if (!nodesVisited.includes(nodeIdChild)) nodesToCheck.push(nodeIdChild);
      });
      nodesVisited.push(nodeChecked);
    }
    menu = (listGraph.map((element) => getMenuFromtListGraph(element)));
    stateChanged = false;
  }

  if (stateChanged) initializeListOfGraph();

  localState = JSON.parse(JSON.stringify(state));

  // collapse all nodes and links children of the clicked node
  // collapse all nodes and links children of the clicked node

  const nodeCanBeCollapsed = (nodeId, nodesCanBeCollapsed = []) => {
    const { nodes, lines } = state;
    const nodesToCheck = [nodeId]
    let canBeCollapsed = true;
    const nodesVisited = nodesCanBeCollapsed;
    while (nodesToCheck.length && canBeCollapsed) {
      const nodeToCheck = nodesToCheck[0];
      const hasParents = lines.filter((line) => line.target === nodeToCheck && !nodesVisited.includes(line.source)).map((line) => line.source);
      const hasChildren = lines.filter((line) => line.source === nodeToCheck);
      if (hasParents.length) {
        hasParents.forEach((nodeParent) => {
          const canParentBeCollapsed = nodeCanBeCollapsed([nodeParent].concat(nodesCanBeCollapsed));
          if (!canParentBeCollapsed) canBeCollapsed = false
        })
      }
      else if (hasChildren.length) {
        hasChildren.forEach(childLine => {
          if (!nodesVisited.includes(childLine.target)) {
            nodesToCheck.push(childLine.target);
          }
        });
      }
      nodesVisited.push(nodeToCheck);
      nodesToCheck.shift();
    }
    return canBeCollapsed;
  }

  const collapseNode = (nodeId, simulation) => {
    const { nodes, lines } = state;
    let nodesToCheck = [nodeId];
    const nodesVisited = [];
    const nodesToCollapse = [];
    while(nodesToCheck.length > 0) {
      const currentNodeId = nodesToCheck[0];
      const targetNodes = lines.filter((line) => line.source === currentNodeId).map((linkInfo) => linkInfo.target);

      if (currentNodeId !== nodeId) {
        const parentNodes = lines.filter((line) => line.target === currentNodeId && !([nodeId]).concat(nodesVisited).includes(line.source)).map((linkInfo) => linkInfo.source);
        if (parentNodes.length > 0) {
          parentNodes.forEach((parentNodeId) => {
            const canBeCollapsed = nodeCanBeCollapsed(parentNodeId, [nodeId].concat(nodesToCollapse));
            if (!nodesToCollapse.includes(parentNodeId) && parentNodeId !== nodeId && canBeCollapsed) {
              nodesToCollapse.push(parentNodeId);
            }
            if (!nodesVisited.includes(parentNodeId)) nodesToCheck.push(parentNodeId);
          });
        }
      }

      targetNodes.forEach((targetNodeId) => {
        const canBeCollapsed = nodeCanBeCollapsed(targetNodeId, [nodeId].concat(nodesToCollapse));
        if (!nodesToCollapse.includes(targetNodeId) && targetNodeId !== nodeId && canBeCollapsed) {
          nodesToCollapse.push(targetNodeId);
        }
      })

      targetNodes.forEach((node) => {
        if (!nodesVisited.includes(node)) nodesToCheck.push(node);
      });
      nodesVisited.push(nodesToCheck.shift());
    }

    newNodesCollapsedState[nodeId] = {
      nodes: nodes.filter((node) => nodesToCollapse.includes(node.id)),
      lines: lines.filter((line) => nodesToCollapse.includes(line.source) || nodesToCollapse.includes(line.target))
    };
    const newNodes = nodes.filter((node) => !nodesToCollapse.includes(node.id));
    const newLines = lines.filter((line) => !nodesToCollapse.includes(line.source) && !nodesToCollapse.includes(line.target));
    setState({ nodes: newNodes, lines: newLines, nodesPos: getNodesPos(newNodes) });
    stateChanged = true;
    showHideNodes = true;
    setResetGraph(true);
  }

  const calculateNewNodePosition = ( { currentPositions, newPos, diagonal = false }) => {
    let iteration = 1;
    let posAvailable = false;
    let newPosition = null;
    while(!posAvailable) {
      const deviation = SIZE_NODE_Y * iteration;
      const deviationX = diagonal ? deviation : 0;
      newPosition = {
        x: newPos.x - deviationX,
        y: newPos.y - deviation
      };
      const canDrawUP = !positionOcuppied(currentPositions, newPosition);
      if (canDrawUP) {
        posAvailable = true;
      } else {
        newPosition = {
          x: newPos.x + deviation,
          y: newPos.y + deviationX, // WIDTH_ICON is to add an inclination to don't cross the text
        };
        newPosition = addInclination(currentPositions, newPosition);
        const canDrawRIGHT = !positionOcuppied(currentPositions, newPosition);
        if (canDrawRIGHT) {
          posAvailable = true;
        } else {
          newPosition = {
            x: newPos.x + deviationX,
            y: newPos.y + deviation
          };
          const canDrawDOWN = !positionOcuppied(currentPositions, newPosition);
          if (canDrawDOWN) {
            posAvailable = true;
          } else {
            newPosition = {
              x: newPos.x - deviation,
              y: newPos.y - deviationX
            };
            const canDrawLEFT = !positionOcuppied(currentPositions, newPosition);
            if (canDrawLEFT) {
              posAvailable = true;
            } else {
              iteration += 1;
            }
          }
        }
      }
    }
    return newPosition;
  }

  const initializePositions = () => {
    const newNodes = state.nodes.filter((node) => !previousNodes.some((oldNode) => oldNode.id === node.id));
    const linksNodes = {}

    let firstNodeMoreLinks = null;
    let secondNodeMoreLinks = null;
    newNodes.forEach((node) => {
      const linkNode = state.lines.filter((link) => link.source === node.id || link.target === node.id).map((link) => link.source === node.id ? link.target : link.source);
      linksNodes[node.id] = linkNode;
      if (!firstNodeMoreLinks || firstNodeMoreLinks.count < linkNode.length) {
        secondNodeMoreLinks = firstNodeMoreLinks && { ...firstNodeMoreLinks };
        firstNodeMoreLinks = { id: node.id, count: linkNode.length};
      } else if (!secondNodeMoreLinks || secondNodeMoreLinks.count < linkNode.length) {
        secondNodeMoreLinks = { id: node.id, count: linkNode.length};
      }
    });

    const sortable = [];
    Object.keys(linksNodes).forEach((nodeId) => {
      sortable.push([nodeId, linksNodes[nodeId]]);
    });
    sortable.sort(function(a, b) {
      return a[1] - b[1];
    });
    const mainNodes = {};
    const nodesMainNodes = sortable.splice(20);
    nodesMainNodes.forEach((nodeInfo) => {
      const [nodeId, value] = nodeInfo;
      mainNodes[nodeId] = value;
    });
    const listMainNodes = Object.keys(mainNodes);

    if (previousNodes.length === 0) {
      if (newNodes.length > 20) {
        listMainNodes.forEach((mainNode) => {
          let row = 0;
          let column = 1;
          simulation.nodes().forEach((nodeSimulation) => {
            const { id } = nodeSimulation;
            const xDistance = width / 5;
            const yDistance = height / 5;
            if (listMainNodes.includes(id)) {
              nodeSimulation.x = xDistance * row;
              nodeSimulation.y = yDistance / column;
              if (row === 5) {
                row = 0;
                column += 1;
              }
            }
          });
        });

        simulation.nodes().forEach((node) => {
          if (node.id === firstNodeMoreLinks.id) {
            node.x = width / 3;
            node.y = height / 3;
          } else if (node.id === secondNodeMoreLinks.id) {
            node.x = (width / 3) * 2;
            node.y = (height / 3) + SMALL_DEVIATION;
          } else if (node.id === secondNodeMoreLinks.id) {
            node.x = (width / 3);
            node.y = (height / 3) * 2 + SMALL_DEVIATION;
          } else if (node.id === secondNodeMoreLinks.id) {
            node.x = (width / 3) * 2;
            node.y = (height / 3) * 2 + SMALL_DEVIATION;
          }
        });
      } else {
        simulation.nodes().forEach((node) => {
          if (node.id === firstNodeMoreLinks.id) {
            node.x = width / 3;
            node.y = height / 2;
          } else if (node.id === secondNodeMoreLinks.id) {
            node.x = (width / 3) * 2;
            node.y = height / 2 + SMALL_DEVIATION;
          }
        });
      }
    }
    const newNodesToDraw = previousNodes.length === 0 ? newNodes.filter((node) => {
      /*if (newNodes.length > 20) {
        return !listMainNodes.includes(node.id);
      }*/
      return (node.id !== firstNodeMoreLinks.id && node.id !== secondNodeMoreLinks.id);
    }) : newNodes;

    const currentPositions = {};
    simulation.nodes().forEach((node) => {
      currentPositions[node.id] = {
        x: node.x,
        y: node.y
      };
    })

    newNodesToDraw.forEach((node) => {
      const linksNode = state.lines.filter((link) => link.source === node.id || link.target === node.id);
      const nodesConntection = linksNode.map((link) => link.source === node.id ? link.target : link.source);
      let newPosition = {};

      if (nodesConntection.length === 1) {
        const newPos = {
          x: currentPositions[nodesConntection[0]].x,
          y: currentPositions[nodesConntection[0]].y
        };
        newPosition = calculateNewNodePosition({ currentPositions, newPos });

      } else {
        newPosition = {
          x: nodesConntection.reduce((accumulator,nodeIdRel) => accumulator + ((currentPositions[nodeIdRel] && currentPositions[nodeIdRel].x) || 0), 0) / (linksNodes[node.id].length || 1),
          y: nodesConntection.reduce((accumulator,nodeIdRel) => accumulator + ((currentPositions[nodeIdRel] && currentPositions[nodeIdRel].y) || 0), 0) / (linksNodes[node.id].length || 1)
        };

        const placeAvailable = !positionOcuppied(currentPositions, newPosition);

        if (!placeAvailable) {
          newPosition = calculateNewNodePosition({ currentPositions, newPos: { ...newPosition }, diagonal: true });
        }
        // newPosition = addInclination(currentPositions, newPosition);
      }

      currentPositions[node.id] = { x: newPosition.x, y: newPosition.y };

      simulation.nodes().forEach((nodeSimulation) => {
        if (nodeSimulation.id === node.id) {
          nodeSimulation.x = newPosition.x;
          nodeSimulation.y = newPosition.y;
        }
      });
      // const posNode =
    })
    previousNodes = JSON.parse(JSON.stringify(state.nodes));
    simulation.restart();
  }

  const handleZoom = (e) => {
    const newPosition = e.transform;
    d3.select('svg g')
      .attr('transform', newPosition);
  };

  const drawGraph = () => {
    const { lines, nodes, nodesPos } = state;
    initializeListOfGraph();

    const svg = d3.select('svg g');

    zoom = d3.zoom().on('zoom', handleZoom);

    d3.select('svg').call(zoom).on("dblclick.zoom", null);

    const links = svg
      .selectAll('line')
      .data(lines)
      .enter()
      .append('line')
      .attr('class', 'arrow')
      .attr('stroke', 'black')
      .attr('opacity', '0.5')
      .attr('marker-end', (d) => "url(#arrow)")//attach the arrow from defs
      .style( "stroke-width", 3 );
    /*
        const rectTooltip = svg
          .selectAll('text')
          .attr('class', 'tooltip-Zaquiel')
          .data(nodes)
          .enter()
          .append('rect')
          .attr("width", 200)
          .attr("height", 20)
          .style("visibility", "hidden")
          .text("I'm a tooltip!")
          .style("fill", "purple");*/



    const rectText = svg
      .selectAll('rect')
      .data(nodes)
      .enter()
      .append('rect')
      .attr("height", 20)
      .style("fill", "white");

    const text = svg
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('alignment-baseline', 'middle')
      .text(node => node.originalName || node.name || node.id)
      .on("click", (d) => {
        navigator.clipboard.writeText(d.currentTarget.__data__.id);
      }).on("mouseover", function(d){
        svg
          .selectAll(`.tooltipText-${d.currentTarget.__data__.id}`)
          .attr('visibility', 'visible');

        svg
          .selectAll('tooltip-area')
          .attr('visibility', 'visible');
        // return toolTipText.style("visibility", "hidden");
      }).on("mouseout", function(d){
        svg.selectAll(`.tooltipText-${d.currentTarget.__data__.id}`).attr('visibility', 'hidden');
      });

    const toolTipText = svg
      .selectAll('toolTipText')
      .data(nodes)
      .enter()
      .append('text')
      .attr('alignment-baseline', 'middle')
      .attr('stroke', 'grey')
      .attr('font-weight', '100')
      .attr('visibility', 'hidden')
      .attr('class', node => `tooltipText-${node.id}`)
      .text(function(d) { return 'line 1'; })
      .on("click", (d) => {
        navigator.clipboard.writeText(d.currentTarget.__data__.id);
      });

    const secondText = svg
      .selectAll('secondText')
      .data(nodes)
      .enter()
      .append('text')
      .attr('alignment-baseline', 'middle')
      .attr('stroke', 'grey')
      .attr('font-weight', '100')
      .text(node => node.secondLabel)
      .on("click", (d) => {
        navigator.clipboard.writeText(d.currentTarget.__data__.id);
      })
    ;

    // arrow
    svg.append("svg:defs").append("svg:marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", WIDTH_ICON - ((WIDTH_ICON - 16) * 0.75))
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");

    simulation = d3.forceSimulation().nodes(nodes)
      .force("link", d3.forceLink(links));

    dragInteraction = d3.drag().on('drag', (event, node) => {
      node.x = event.x;
      node.y = event.y;
      simulation.alpha = 1;
      simulation.restart();
    });

    var defs = svg.append("svg:defs");

    images.forEach((image) => {
      defs.append('svg:pattern')
        .attr("class", "logo")
        .attr("id", `${image}`)
        .attr("width", 1)
        .attr("height", 1)
        .append("svg:image")
        .attr("xlink:href", `/images/${image}.png`)
        .attr("style", `width: ${WIDTH_ICON}px;`);
    });

    const circles = svg
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', WIDTH_ICON / 2)
      .style("fill", "#fff")
      .style("fill", (node) => node.image ? `url(#${node.image})` : "url(#image)")
      .on("click", (d) => {
        countClicks += 1;
        setTimeout(function() {
          if (countClicks === 1) {
            const nodeId = d.target.__data__.id;
            if (newNodesCollapsedState[nodeId]) {
              const { nodes, lines } = newNodesCollapsedState[nodeId];
              const newNodes = localState.nodes.concat(nodes);
              previousNodes = JSON.parse(JSON.stringify(newNodes));
              setState({ nodes: newNodes, lines: localState.lines.concat(lines), nodesPos: getNodesPos(newNodes) });
              stateChanged = true;
              showHideNodes = true;
              delete newNodesCollapsedState[nodeId]
              setResetGraph(true)
            } else {
              collapseNode(d.target.__data__.id, simulation);
            }
            onClick(d, simulation);
          }
          countClicks = 0;
        }, 200);
      })
      .on("dblclick", function(d) {
        nodeClicked = d;
        onDoubleClick(d);
      })
      .call(dragInteraction);

    simulation.on('tick', () => {
      circles
        .attr('cx', node => node.x)
        .attr('cy', node => node.y);
      rectText.attr('x', node => node.x + (WIDTH_ICON / 2) + 5).attr('y', node => node.y - 25).attr('width', node => node.originalName.length * 8).attr('class', node => `rect-${node.id}`);
      text
        .attr('x', node => node.x + (WIDTH_ICON / 2) + 5).attr('y', node => node.y - 15);
      toolTipText.attr('x', node => node.x + (WIDTH_ICON / 2) + 5).attr('y', node => node.y + 20);
      secondText
        .attr('x', node => node.x + (WIDTH_ICON / 2) + 5).attr('y', node => node.y + 10);
      links.attr('x1',link => {
        return (nodes[nodesPos[link.source]] && nodes[nodesPos[link.source]].x);
      })
        .attr('y1',link => nodes[nodesPos[link.source]] && nodes[nodesPos[link.source]].y)
        .attr('x2',link => nodes[nodesPos[link.target]] && nodes[nodesPos[link.target]].x)
        .attr('y2',link => nodes[nodesPos[link.target]] && nodes[nodesPos[link.target]].y);
    });
    initializePositions();
  }

  const getPosNode = (idNode) => {
    if (!idNode) {
      const newX = state.nodes.reduce((total, node) => node.x + total) / state.nodes.length;
      const newY = state.nodes.reduce((total, node) => node.y + total) / state.nodes.length;

      return {x: newX || 0, y: newY || 0 }
    }
    const nodeSelected = state.nodes.find((node) => node.id.toString() === idNode);
    const posX = nodeSelected ? nodeSelected.x + 50 : 0;
    const posY = nodeSelected ? nodeSelected.y : 0;

    return {x: posX, y: posY }
  }

  useEffect(() => {
    if (!firstRender) {
      drawGraph();
      getResetGraph(setResetGraph);
    } else {
      firstRender = false;
    }
  }, [state]);

  useEffect(() => {
    setResetGraph(true);
  }, [dateUpdated]);

  useEffect(() => {
    const { nodes, lines, nodesPos } = state;

    const nodesChanged = showHideNodes ? [...nodes] : [...nodesProps];
    const linesChanged = showHideNodes ? [...lines]: [...linksProps];

    if (resetGraph) {
      const newNodesPos = getNodesPos(nodesChanged);
      const newNodes = nodesChanged.map((node) => {
        if (nodesPos[node.id] !== undefined) {
          const oldNode = nodes[nodesPos[node.id]];
          return ({ ...node, x: oldNode.x, y: oldNode.y  });
        }
        return node;
      })
      setState({...state, nodes: newNodes, lines: linesChanged, nodesPos: newNodesPos });
      stateChanged = true;
      setResetGraph(false);
    } else {
      if (zoom && state.nodes.length > 0) {
        if (nodeClicked) {
          const { id } = nodeClicked.target.__data__;
          const { x, y } = getPosNode(id);
          d3.select('svg')
            .transition()
            .call(zoom.translateTo, x, y);
        } else {
          const { x, y } = getPosNode();
          d3.select('svg')
            .transition()
            .call(zoom.translateTo, x, y);
        }
      }
    }
    if (showHideNodes) showHideNodes = false;
  }, [resetGraph]);

  return (
    <Layout>
      {showListGraph && (<Sider width={400} className="site-layout-background">
        <Menu
          mode="inline"
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          style={{ height: '100%', borderRight: 0 }}
          onClick={(selectedElement) => {
            const { key } = selectedElement;
            const { x, y } = getPosNode(key);
            d3.select('svg')
              .transition()
              .call(zoom.translateTo, x, y);
          }}
        >
          {menu}
        </Menu>
      </Sider>)}
      <Layout>
        <Content>
          { !resetGraph && (
            <svg width={width} height={height}>
              <g></g>
            </svg>
          )}
        </Content>

      </Layout>

    </Layout>
  );
}

Graph.propTypes = {
  dateUpdated: propTypes.number,
  images: propTypes.array,
  getResetGraph: propTypes.func,
  links: propTypes.array.isRequired,
  nodes: propTypes.array.isRequired,
  onClick: propTypes.func.isRequired,
  onDoubleClick: propTypes.func.isRequired,
  showListGraph: propTypes.bool,
  width: propTypes.number,
  height: propTypes.number
}

Graph.defaultProps = {
  dateUpdated: new Date().getTime(),
  images: [],
  getResetGraph: () => {},
  nodes: nodes_init,
  links: lines_init,
  onClick: () => {},
  onDoubleClick: () => {},
  showListGraph: false,
  width: WIDTH,
  height: HEIGHT,
}

export default Graph;
