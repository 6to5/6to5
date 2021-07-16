const keys = []
const d = () => {
  const e = () => {
    for (const key of keys) {}
  }
}

const a = () => {
  const keys = []
  const c = () => {
    for (const key of keys) {}
  }
  return c
}

var _keys = []
const b = () => {
  const c = () => {
    for (const key of _keys) {}
  }
  return c
}

_keys = 'foo'
