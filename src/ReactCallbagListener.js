import React from 'react'
import PropTypes from 'prop-types'

export default class ReactCallbagProps extends React.Component {
  static propTypes = {
    children: PropTypes.func
  }

  talkbacks = {}
  state = {}

  componentDidMount() {
    Object.keys(this.props)
      .filter(key => key !== 'children')
      .forEach(key => {
        const callbag = this.props[key]
        if (callbag) {
          this.subscribe(key, callbag)
        }
      })
  }

  componentDidUpdate(prevProps) {
    // look for new props
    Object.keys(this.props).forEach(key => {
      const newCallbag = this.props[key]
      const oldCallbag = prevProps[key]
      if (newCallbag !== oldCallbag) {
        if (oldCallbag === undefined) {
          // got a new one!
          this.subscribe(key, newCallbag)
        } else {
          // callbag changed, unsubscribe and resubscribe to new one
          const talkback = this.talkbacks[key]
          if (talkback) {
            talkback(2)
          }
          this.unsubscribe(key, oldCallbag)
          if (newCallbag) {
            this.subscribe(key, newCallbag)
          }
        }
      }
    })
  }

  componentWillUnmount() {
    Object.keys(this.talkbacks).forEach(key => this.talkbacks[key](2))
  }

  subscribe = (key, callbag) => {
    callbag(0, (type, data) => {
      if (type === 0) this.talkbacks[key] = data
      else if (type === 1) this.setState({ [key]: data })
      else if (type === 2) this.unsubscribe(key, callbag)

      if (type === 0 || type === 1) this.talkbacks[key](1)
    })
  }

  unsubscribe = (key, callbag) => {
    this.setState({ [key]: undefined })
    delete this.talkbacks[key]
  }

  render() {
    return this.props.children(this.state)
  }
}
