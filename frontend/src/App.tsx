import React from 'react'
import Amplify from '@aws-amplify/core'

import { withAuthenticator } from 'aws-amplify-react'

import './App.css'
import awsconfig from './aws-exports'

import Button from 'antd/es/button'

Amplify.configure(awsconfig)

const App = () => (
  <div className="App">
    <Button type="primary">Button</Button>
  </div>
)

export default withAuthenticator(App, true)
