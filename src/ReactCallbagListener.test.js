import React from 'react'
import TestUtils from 'react-dom/test-utils'
import ReactCallbagListener from './ReactCallbagListener'

describe('ReactCallbagListener', () => {
  const makeTestCallbag = () => {
    let sink
    const unsubscribe = jest.fn()
    return {
      send: data => sink(1, data),
      cancel: () => sink(2),
      nonsense: () => sink(42),
      callbag: (type, data) => {
        if (type !== 0) return
        sink = data
        sink(0, t => {
          if (t === 2) {
            unsubscribe()
          }
        })
      },
      unsubscribe
    }
  }

  it('should subscribe to a callbag on mount', () => {
    const callbag = jest.fn()
    TestUtils.renderIntoDocument(
      <ReactCallbagListener foo={callbag}>{() => <div />}</ReactCallbagListener>
    )
    expect(callbag).toHaveBeenCalled()
    expect(callbag).toHaveBeenCalledTimes(1)
    expect(callbag.mock.calls[0][0]).toBe(0)
    expect(typeof callbag.mock.calls[0][1]).toBe('function')
  })

  it('should unsubscribe from a callbag on unmount', () => {
    const { callbag, unsubscribe } = makeTestCallbag()

    class Container extends React.Component {
      state = {
        shown: true
      }
      render() {
        return (
          <div>
            {this.state.shown && (
              <ReactCallbagListener foo={callbag}>
                {() => <div />}
              </ReactCallbagListener>
            )}
            <button onClick={() => this.setState({ shown: false })}>
              Hide
            </button>
          </div>
        )
      }
    }
    const dom = TestUtils.renderIntoDocument(<Container />)
    const button = TestUtils.findRenderedDOMComponentWithTag(dom, 'button')

    expect(unsubscribe).not.toHaveBeenCalled()
    TestUtils.Simulate.click(button)
    expect(unsubscribe).toHaveBeenCalled()
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('should listen to a callbag', () => {
    const unsubscribe = jest.fn()
    const { callbag, send } = makeTestCallbag()
    const render = jest.fn(() => <div />)

    expect(render).not.toHaveBeenCalled()
    expect(unsubscribe).not.toHaveBeenCalled()
    TestUtils.renderIntoDocument(
      <ReactCallbagListener foo={callbag}>{render}</ReactCallbagListener>
    )
    expect(render).toHaveBeenCalled()
    expect(render).toHaveBeenCalledTimes(1)
    expect(render.mock.calls[0][0]).toEqual({})

    send('bar')

    expect(render).toHaveBeenCalledTimes(2)
    expect(render.mock.calls[1][0]).toEqual({ foo: 'bar' })

    expect(unsubscribe).not.toHaveBeenCalled()
  })

  it('should unsubscribe when callbag prop disappears', () => {
    const { callbag, unsubscribe } = makeTestCallbag()

    class Container extends React.Component {
      state = {
        useCallbag: true
      }
      render() {
        const props = {}
        if (this.state.useCallbag) {
          props.foo = callbag
        }
        return (
          <div>
            <ReactCallbagListener {...props}>
              {() => <div />}
            </ReactCallbagListener>
            <button onClick={() => this.setState({ useCallbag: false })}>
              Hide
            </button>
          </div>
        )
      }
    }
    const dom = TestUtils.renderIntoDocument(<Container />)
    const button = TestUtils.findRenderedDOMComponentWithTag(dom, 'button')

    expect(unsubscribe).not.toHaveBeenCalled()
    TestUtils.Simulate.click(button)
    expect(unsubscribe).toHaveBeenCalled()
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('should subscribe when new callbag prop appears', () => {
    const callbag = jest.fn()
    class Container extends React.Component {
      state = {
        useCallbag: false
      }
      render() {
        return (
          <div>
            <ReactCallbagListener
              foo={this.state.useCallbag ? callbag : undefined}
            >
              {() => <div />}
            </ReactCallbagListener>
            <button onClick={() => this.setState({ useCallbag: true })}>
              Hide
            </button>
          </div>
        )
      }
    }
    const dom = TestUtils.renderIntoDocument(<Container />)
    const button = TestUtils.findRenderedDOMComponentWithTag(dom, 'button')

    expect(callbag).not.toHaveBeenCalled()
    TestUtils.Simulate.click(button)
    expect(callbag).toHaveBeenCalled()
    expect(callbag.mock.calls[0][0]).toBe(0)
    expect(typeof callbag.mock.calls[0][1]).toBe('function')
  })

  it('should unsubscribe/subscribe when callbag prop changes', () => {
    const { callbag, unsubscribe } = makeTestCallbag()
    const callbagB = jest.fn()
    class Container extends React.Component {
      state = {
        useB: false
      }
      render() {
        return (
          <div>
            <ReactCallbagListener foo={this.state.useB ? callbagB : callbag}>
              {() => <div />}
            </ReactCallbagListener>
            <button onClick={() => this.setState({ useB: true })}>Hide</button>
          </div>
        )
      }
    }
    const dom = TestUtils.renderIntoDocument(<Container />)
    const button = TestUtils.findRenderedDOMComponentWithTag(dom, 'button')

    expect(unsubscribe).not.toHaveBeenCalled()
    expect(callbagB).not.toHaveBeenCalled()
    TestUtils.Simulate.click(button)
    expect(unsubscribe).toHaveBeenCalled()
    expect(unsubscribe).toHaveBeenCalledTimes(1)
    expect(callbagB).toHaveBeenCalled()
    expect(callbagB.mock.calls[0][0]).toBe(0)
    expect(typeof callbagB.mock.calls[0][1]).toBe('function')
  })

  it('should clear value if source is cancelled', () => {
    const { callbag, send, cancel } = makeTestCallbag()
    const render = jest.fn(() => <div />)

    TestUtils.renderIntoDocument(
      <ReactCallbagListener foo={callbag}>{render}</ReactCallbagListener>
    )

    expect(render).toHaveBeenCalled()
    expect(render).toHaveBeenCalledTimes(1)
    expect(render.mock.calls[0][0]).toEqual({})

    send(42)

    expect(render).toHaveBeenCalledTimes(2)
    expect(render.mock.calls[1][0]).toEqual({ foo: 42 })

    cancel()

    expect(render).toHaveBeenCalledTimes(3)
    expect(render.mock.calls[2][0]).toEqual({})
  })

  it('should ignore invalid nonsense messages', () => {
    // this is mostly for code coverage reasons
    const { callbag, send, nonsense } = makeTestCallbag()
    const render = jest.fn(() => <div />)

    TestUtils.renderIntoDocument(
      <ReactCallbagListener foo={callbag}>{render}</ReactCallbagListener>
    )

    expect(render).toHaveBeenCalled()
    expect(render).toHaveBeenCalledTimes(1)
    expect(render.mock.calls[0][0]).toEqual({})

    send(42)

    expect(render).toHaveBeenCalledTimes(2)
    expect(render.mock.calls[1][0]).toEqual({ foo: 42 })

    nonsense()

    expect(render).toHaveBeenCalledTimes(2)
  })

  it('should listen to multiple callbags', () => {
    const { callbag: callbagA, send: sendA } = makeTestCallbag()
    const { callbag: callbagB, send: sendB } = makeTestCallbag()
    const render = jest.fn(() => <div />)

    expect(render).not.toHaveBeenCalled()
    TestUtils.renderIntoDocument(
      <ReactCallbagListener a={callbagA} b={callbagB}>
        {render}
      </ReactCallbagListener>
    )
    expect(render).toHaveBeenCalled()
    expect(render).toHaveBeenCalledTimes(1)
    expect(render.mock.calls[0][0]).toEqual({})

    sendA(42)

    expect(render).toHaveBeenCalledTimes(2)
    expect(render.mock.calls[1][0]).toEqual({ a: 42 })

    sendB(33)

    expect(render).toHaveBeenCalledTimes(3)
    expect(render.mock.calls[2][0]).toEqual({ a: 42, b: 33 })

    sendA(4)

    expect(render).toHaveBeenCalledTimes(4)
    expect(render.mock.calls[3][0]).toEqual({ a: 4, b: 33 })
  })
})
