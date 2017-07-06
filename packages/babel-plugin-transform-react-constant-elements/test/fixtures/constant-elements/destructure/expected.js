class AnchorLink extends Component {
  render() {
    const _props = this.props,
          isExternal = _props.isExternal,
          children = _props.children;

    if (isExternal) {
      return <a>{children}</a>;
    }

    return <Link>{children}</Link>;
  }

}