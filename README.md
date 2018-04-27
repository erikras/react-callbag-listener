# 👂 React Callbag Listener

[![NPM Downloads](https://img.shields.io/npm/dm/react-callbag-listener.svg?style=flat)](https://www.npmjs.com/package/react-callbag-listener)
[![Build Status](https://travis-ci.org/erikras/react-callbag-listener.svg?branch=master)](https://travis-ci.org/erikras/react-callbag-listener)
[![codecov.io](https://codecov.io/gh/erikras/react-callbag-listener/branch/master/graph/badge.svg)](https://codecov.io/gh/erikras/react-callbag-listener)

---

So you've seen the light and accepted [Callbags](https://github.com/callbag/callbag) as the future of reactive front-end development, but you need to update a React component every time a callbag emits a new value?

👂 React Callbag Listener is the answer!

---

## Demo 👀

[![Edit 👂 React Callbag Listener Demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/4y2z5j6v7)

---

## Installation

```bash
npm install --save react-callbag-listener
```

or

```bash
yarn add react-callbag-listener
```

## How it works

You provide any number of callbags as props to 👂 React Callbag Listener, and the render function given as `children` will be rendered whenever any of them changes.

```jsx
import CallbagListener from 'react-callbag-listener'

...

// foo$ and bar$ are callbag sources that will emit values
<CallbagListener foo={foo$} bar={bar$}>
  {({ foo, bar }) => (
    <div>
      <div>Foo value is: {foo}</div>
      <div>Bar value is: {bar}</div>
    </div>
  )}
</CallbagListener>
```

That's it. There are no other options or API to document. The object given to your render prop will have the same keys as you passed as callbag props.
