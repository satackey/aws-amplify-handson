import React, {useEffect, useState} from 'react'

import { Form, Button, Input } from 'antd'

import Amplify from '@aws-amplify/core'
import { withAuthenticator } from 'aws-amplify-react'

import './App.css'
import awsconfig from './aws-exports'
import {CreateTodoInput, CreateTodoMutationVariables} from './API'
import API, {graphqlOperation} from "@aws-amplify/api";
import {createTodo} from "./graphql/mutations";
import {listTodos} from "./graphql/queries";

Amplify.configure(awsconfig)

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 8 },
}
const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
}

const App = () => {
    const addTodo = async () => {
        const newTodoInput: CreateTodoInput = {
            name: todoTitle,
            description: todoContent,
        }
        const newTodo: CreateTodoMutationVariables = {
            input: newTodoInput,
        }
        API.graphql(graphqlOperation(createTodo, newTodo))
    }

    const fetchTodo = async () => {
        const result: any =  await API.graphql(graphqlOperation(listTodos))
        if ('data' in result && result.data == null) {
            // there is no todo to show.
            return
        }
        setTodos(prev => [...prev, ...result.data.listTodos.items])
    }

    const [todoTitle, setTodoTitle] = useState('')
    const [todoContent, setTodoContent] = useState('')
    const [todos, setTodos] = useState<CreateTodoInput[]>([])
    const [form] = Form.useForm()
    useEffect(() => { fetchTodo() }, [])

    console.log(todos)

    return (
        <div className="App">
            <Form {...layout} form={form}>
                New Todo
                <Form.Item name="note" label="Note" rules={[{ required: true }]}>
                    <Input
                        type="text"
                        value={todoTitle}
                        onChange={e => setTodoTitle(e.target.value)}
                    />
                </Form.Item>
                <Form.Item name="Description" label="Description" rules={[{ required: true }]}>
                    <Input
                        type="text"
                        value={todoContent}
                        onChange={e => setTodoContent((e.target.value))}
                    />
                </Form.Item>
                <Form.Item {...tailLayout}>
                    <Button type="primary" onClick={addTodo}>Add</Button>
                </Form.Item>
            </Form>
            <div
                className="todo-items"
            >
                Todos:
                {todos.map(todo => (
                    <div key={String(todo.id)}>
                        <div>
                            Name: {todo.name}
                        </div>
                        <div>
                            Description: {todo.description}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    )
}

export default withAuthenticator(App, true)
