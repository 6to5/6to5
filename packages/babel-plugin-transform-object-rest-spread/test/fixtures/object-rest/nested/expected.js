const defunct = {
  outer: {
    inner: {
      three: 'three',
      four: 'four'
    }
  }
};
const {
  outer: {
    inner: {
      three
    }
  }
} = defunct,
      other = babelHelpers.objectWithoutProperties(defunct.outer.inner, ["three"]);