const keys = []

function a() {
  for (const key of keys) {}
}

const b = () => {
  for (const key of keys) {}
}

const c = function () {
  for (const key of keys) {}
}

const { foo } = () => {
  for (const key of keys) {}
}
