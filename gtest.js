graph = [
  {
    "name": "a",
    "children": [
      {
        "name": "aa",
        "children": [
          {"name": "aaa"},
          {"name": "aab"},
          {"name": "aac"},
          {
            "name": "aad",
            "children": [
              {"name": "aada"},
              {"name": "aadb"}
            ]
          },
        ]
      },
      {"name": "ab"},
      {
        "name": "ac",
        "children": [
          {"name": "aca"},
          {"name": "acb"},
          {"name": "acc"},
          {"name": "acd"},
        ]
      },
      {"name": "ad"},
    ]
  },
  {"name": "b"},
  {"name": "c"}
]

var a = graph[0];

var maxLevel = 0;

const nodes = []

function traverse(level, parent) {
  if (Array.isArray(parent)) {
    parent.forEach(child => {
      console.log(`level: ${level} name:${child.name}`)
      nodes.push({
        "level": level,
        "node": child
      })
      maxLevel = Math.max(maxLevel, level)
      if (child.children) {
        traverse(level + 1, child.children)
      }
    })
  }
}

traverse(1, graph)

nodes.sort((a1, b) => {
  return b.level - a1.level;
})

const names = [];

nodes.forEach(value => {
  names[value.node.name] = value;
})

nodes.forEach(value => {
  let name = value.node.name;
  console.log(Object.keys( names ).length)
  delete names[name]
  console.log(name)
})

console.log(`
maxLevel: ${maxLevel},
nodes:  ${nodes}
`)

var maxDepth = 0;

// console.log(JSON.stringify(graph, " ", 1))
