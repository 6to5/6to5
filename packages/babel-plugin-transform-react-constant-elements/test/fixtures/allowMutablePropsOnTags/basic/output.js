var _FormattedMessage;

var Foo = React.createClass({
  render: function () {
    return _FormattedMessage || (_FormattedMessage = <FormattedMessage id="someMessage.foo" defaultMessage={"Some text, " + "and some more too. {someValue}"} description="A test message for babel." values={{
      someValue: "A value."
    }} />);
  }
});
