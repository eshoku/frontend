import type { NextPage } from 'next'
import { UserForm, UserData } from '../types/UserInfo'
import React, { useEffect, useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0'
import { useForm, SubmitHandler } from 'react-hook-form'
import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import { useRequireUserInfo } from '../hooks/useRequireUserInfo'
import { useCurrentUser } from '../hooks/useCurrentUser'
import axios from 'axios'
import Head from 'next/head'
import Nav from '../components/nav'
import Loading from '../components/loading'

const UserInfo: NextPage = () => {
  const { user, error: errAuth, isLoading } = useUser()
  const [isDataLoading, setIsDataLoading] = useState(true)

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
    /**
     * ユーザー情報の取得
     */
    const getUser = async () => {
      try {
        setIsDataLoading(true)
        const res = await axios.get<UserData>('/api/user')
        const inputValues: UserForm = res.data
        setIsDataLoading(false)
        reset(inputValues)
      } catch {
        alert('データの取得に失敗しました')
      }
    }
    getUser()
  }, [reset])

  const onSubmit: SubmitHandler<UserForm> = (data) => {
    const dt = new Date(data.date_of_birth)
    data.date_of_birth = `${dt.getFullYear()}-${
      dt.getMonth() + 1
    }-${dt.getDate()}`
    axios
      .post('/api/user', data)
      .then(() => alert('正常に更新されました'))
      .catch(() => alert('更新できませんでした'))
  }

  useRequireUserInfo()
  const { userChecking } = useCurrentUser()

  return (
    <Nav>
      <Head>
        <title>ユーザー情報編集 | e-Shoku</title>
      </Head>
      <div className="container">
        <h2 className="title">ユーザー情報編集</h2>
        {(isLoading || isDataLoading || userChecking) && <Loading />}
        {errAuth && (
          <>
            <h4>Error</h4>
            <pre>{errAuth.message}</pre>
          </>
        )}
        {user && !isLoading && !isDataLoading && (
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
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
                <label
                  htmlFor="displayName"
                  className="col-sm-3 col-form-label"
                >
                  名前
                </label>
                <div className="col-sm-9">
                  <input
                    {...register('display_name', {
                      required: true,
                      maxLength: 128,
                    })}
                    className={`form-control`}
                    id="displayName"
                    placeholder="例) 坂村 一郎"
                  />
                  {errors.display_name && (
                    <p className="small text-danger">正しく入力してください</p>
                  )}
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="usernameId" className="col-sm-3 col-form-label">
                  ユーザーネーム（半角英数）
                </label>
                <div className="col-sm-9">
                  <input
                    {...register('username', {
                      required: true,
                      minLength: 2,
                      maxLength: 128,
                      pattern: /^[A-Za-z]+$/i,
                    })}
                    className={`form-control`}
                    id="usernameId"
                    placeholder="例) ichiro"
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
              <div className="text-end">
                <button type="submit" className="btn btn-form">
                  保存
                </button>
              </div>
            </form>
          </div>
        )}
        {!isLoading && !isDataLoading && !errAuth && !user && (
          // Error component を呼び出す予定
          <div className="text-center">データの取得に失敗しました</div>
        )}
      </div>
    </Nav>
  )
}

// ログイン必須にする処理
export default withPageAuthRequired(UserInfo, {
  onRedirecting: () => <Loading />,
  // onError: error => <ErrorMessage>{error.message}</ErrorMessage>
})
