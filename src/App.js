
import React, { useState } from 'react';
// import Graph from './components/Graph';
import Tree from './components/Tree';
import Graph from './components/Graph';
import {
  mockupLinks1,
  mockupLinks2,
  mockupLinks3,
  mockupLinks4,
  mockupLinks5, mockupNodes1, mockupNodes2,
  mockupNodes3,
  mockupNodes4,
  mockupNodes5
} from './helpers/constants';


function App() {
  const localNodes = [
    {
      id: 6964,
      image: 'proceso',
      originalName: 'kpfm-es-spk-qlt-reclassificationsparquet-01',
      secondLabel: 'Dataproc',
      tooltipInfo: {
        prop1: "prosad",
        prop2: "p",
        prop3: "pr"
      }
    },
    {
      id: 3072,
      image: 'nodo',
      originalName: 't_kqpd_stats',
      secondLabel: 'HDFS-Parquet | MASTERDATA',
      tooltipInfo: {
        prop4: "uno, dos, tres, cuatro, cincoas dasdasdasd asdasd asdasdas das final",
        prop5: "asd",
      }
    },
    {
      id: 5658,
      image: 'nodo',
      originalName: 't_kpfm_reclassification_raw'
    },
    {
      id: 1,
      image: 'nodo',
      originalName: 'nodo1',
      tooltipInfo: {
        prop6: "property 6",
        prop7: "property 7",
      }
    },
    {
      id: 2,
      image: 'nodo',
      originalName: 'nodo2'
    }
  ];
  const localLinks = [
    {
      source: 6964,
      target: 3072
    },
    {
      source: 5658,
      target: 6964
    },
    {
      source: 6964,
      target: 1,
    },
    {
      source: 2,
      target: 1,
    },
    {
      source: 6964,
      target: 5658,
    }
  ];
  const [nodes, setNodes] = useState(localNodes);
  const [links, setLinks] = useState(localLinks);

  return (
    <Graph
      images={["image", "nodo", "principal", "proceso"]}
      links={links}
      nodes={JSON.parse(JSON.stringify(nodes))}
    />
    /*<Tree />*/
  );
}

export default App;
