/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import knex from 'knex'
import { v4 } from 'uuid'
/* eslint-disable @typescript-eslint/no-var-requires */
import { ScopeID, ScopeTypeInterface, scopePath } from '@ir-engine/common/src/schemas/scope/scope.schema'
import { UserType, userPath } from '@ir-engine/common/src/schemas/user/user.schema'

import dotenv from 'dotenv-flow'
import appRootPath from 'app-root-path'
import { scopeTypeSeed } from '@ir-engine/server-core/src/scope/scope-type/scope-type.seed'

dotenv.config({
  path: appRootPath.path,
  silent: true
})

export const makeAdmin = async (userId) => {
  try {
    const knexClient = knex({
      client: 'mysql',
      connection: {
        user: process.env.MYSQL_USER ?? 'server',
        password: process.env.MYSQL_PASSWORD ?? 'password',
        host: process.env.MYSQL_HOST ?? '127.0.0.1',
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        database: process.env.MYSQL_DATABASE ?? 'ir-engine',
        charset: 'utf8mb4'
      }
    })

    const userMatch = await knexClient
      .from<UserType>(userPath)
      .where({
        id: userId
      })
      .first()

    if (userMatch != null) {
      for (const { type } of scopeTypeSeed) {
        try {
          const existingScope = await knexClient
            .from<ScopeTypeInterface>(scopePath)
            .where({
              userId: userId,
              type
            })
            .first()
          if (existingScope == null) {
            await knexClient.from<ScopeTypeInterface>(scopePath).insert({
              id: v4() as ScopeID,
              userId: userId,
              type,
              createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
              updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
            })
            console.info(`Adding user: ${userId}, scope: ${type}`)
          }
        } catch (e) {
          console.log(e)
        }
      }

      console.info(`User with id ${userId} made an admin`)
    } else {
      console.error(`User with id ${userId} does not exist`)
    }
  } catch (err) {
    console.error(err)
  }
}
