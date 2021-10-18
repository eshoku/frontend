import type { NextPage } from 'next'
import type { UserForm, UserData } from '../types/UserInfo'
import React, { useEffect } from 'react'
import { useUser } from '@auth0/nextjs-auth0'
import { useForm, SubmitHandler } from 'react-hook-form'
import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import axios from 'axios'
import Head from 'next/head'

const UserInfo: NextPage = () => {
  const { user, error: errAuth, isLoading } = useUser()

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<UserForm>({
    defaultValues: {
      username: '',
      display_name: '',
      date_of_birth: '',
      gender: undefined,
    },
  })

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get<UserData>('/api/user')
        const inputValues: UserForm = res.data
        reset(inputValues)
      } catch {
        alert('データの取得に失敗しました')
      }
    }
    getUser()
  }, [reset])

  const onSubmit: SubmitHandler<UserForm> = (data) => {
    if (user !== undefined) {
      data.display_name = user.name as string
    }
    const dt = new Date(data.date_of_birth)
    data.date_of_birth = `${dt.getFullYear()}-${
      dt.getMonth() + 1
    }-${dt.getDate()}`
    axios
      .post('/api/user', data)
      .then(() => alert('正常に更新されました'))
      .catch(() => alert('更新できませんでした'))
  }
  return (
    <>
      <Head>
        <title>ユーザー情報編集 | e-Shoku</title>
      </Head>
      <div className="container">
        <h2>ユーザー情報編集</h2>
        {isLoading && <p>読み込み中…</p>}
        {errAuth && (
          <>
            <h4>Error</h4>
            <pre>{errAuth.message}</pre>
          </>
        )}
        {user && (
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3 row">
                <label
                  htmlFor="staticDisplayName"
                  className="col-sm-3 col-form-label"
                >
                  表示名
                </label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className="form-control-plaintext"
                    id="staticDisplayName"
                    value={user.name as string}
                    readOnly
                  />
                </div>
              </div>
              <div className="mb-3 row">
                <label
                  htmlFor="staticEmail"
                  className="col-sm-3 col-form-label"
                >
                  メールアドレス
                </label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className="form-control-plaintext"
                    id="staticEmail"
                    value={user.email as string}
                    readOnly
                  />
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="usernameId" className="col-sm-3 col-form-label">
                  ユーザーネーム
                </label>
                <div className="col-sm-9">
                  <input
                    {...register('username', {
                      required: true,
                      minLength: 2,
                      maxLength: 128,
                    })}
                    className={`form-control`}
                    id="usernameId"
                  />
                  {errors.username && (
                    <p className="small text-danger">正しく入力してください</p>
                  )}
                </div>
              </div>
              <div className="mb-3 row">
                <label
                  htmlFor="dateOfBirthId"
                  className="col-sm-3 col-form-label"
                >
                  生年月日
                </label>
                <div className="col-sm-9">
                  <input
                    {...register('date_of_birth', { required: true })}
                    className={`form-control`}
                    id="dateOfBirthId"
                    type="date"
                  />
                  {errors.date_of_birth && (
                    <p className="small text-danger">正しく入力してください</p>
                  )}
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="genderId" className="col-sm-3 col-form-label">
                  性別
                </label>
                <div className="col-sm-9">
                  <select
                    {...register('gender', { required: true })}
                    className="form-select"
                    id="genderId"
                    aria-label="性別を選択してください"
                  >
                    <option value="">選択してください…</option>
                    <option value="MALE">男性</option>
                    <option value="FEMALE">女性</option>
                    <option value="PNTS">答えない</option>
                    <option value="OTHERS">その他</option>
                  </select>
                  {errors.gender && (
                    <p className="small text-danger">正しく選択してください</p>
                  )}
                </div>
              </div>
              <input type="submit" />
            </form>
          </div>
        )}
        {!isLoading && !errAuth && !user && (
          <div>
            <a href="/api/auth/login">Login</a>
          </div>
        )}
      </div>
    </>
  )
}

export default withPageAuthRequired(UserInfo, {
  // onRedirecting: () => <Loading />,
  // onError: error => <ErrorMessage>{error.message}</ErrorMessage>
})
