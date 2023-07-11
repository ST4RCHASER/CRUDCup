import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import cron from 'node-cron'
import {
  createResourceEntity,
  deleteCup,
  deleteEntity,
  deleteResource,
  getCupFormSlug,
  verifyCup,
  getEntities,
  getEntity,
  purgeExpiredCups,
  updateEntity,
  updateCupSettings,
} from './services/resource'
import { convertSecretKey, verifyEntityId, verifyResourceName } from './utils'

export const app = new Elysia()
  .use(cors({ origin: '*' }))
  .all('/', () =>
    JSON.stringify({
      success: true,
      code: 201,
      message: 'Welcome!',
      home: 'https://cup.m1r.ai',
      github: 'https://github.com/ST4RCHASER/CRUDCup',
    })
  )
  .group(
    '/:cupId',
    {
      beforeHandle: async ({ set, params: { cupId }, request: { method }, headers: { authorization } }) => verifyCup(cupId, method, convertSecretKey(authorization)),
    },
    cupGroup =>
      cupGroup
        .get('/', async ({ params: { cupId } }) => getCupFormSlug(cupId))
        .put('/', async ({ params: { cupId }, request: { json } }) => updateCupSettings(cupId, await json()))
        .delete('/', async ({ params: { cupId } }) => deleteCup(cupId))
        .group(
          '/:resourceId',
          {
            beforeHandle: ({ params: { resourceId } }) =>
              verifyResourceName(resourceId),
          },
          resourceGroup =>
            resourceGroup
              .get('/', async ({ params: { cupId, resourceId } }) =>
                getEntities(cupId, resourceId)
              )
              .post('/', async ({ params: { cupId, resourceId }, body }) =>
                createResourceEntity(cupId, resourceId, body)
              )
              .delete('/', async ({ params: { cupId, resourceId } }) =>
                deleteResource(cupId, resourceId)
              )
              .group(
                '/:entityId',
                {
                  beforeHandle: ({ params: { entityId } }) =>
                    verifyEntityId(entityId),
                },
                entityGroup =>
                  entityGroup
                    .get(
                      '/',
                      async ({ params: { cupId, resourceId, entityId } }) =>
                        getEntity(cupId, resourceId, entityId)
                    )
                    .put(
                      '/',
                      async ({
                        params: { cupId, resourceId, entityId },
                        body,
                      }) => updateEntity(cupId, resourceId, entityId, body)
                    )
                    .delete(
                      '/',
                      async ({ params: { cupId, resourceId, entityId } }) =>
                        deleteEntity(cupId, resourceId, entityId)
                    )
              )
        )
  )
  .listen({
    port: process.env.PORT || 3000,
    hostname: process.env.HOSTNAME || 'localhost',
  })

console.log(
  `⚡ CRUDCup is running at ${app.server?.hostname}:${app.server?.port}`
)

purgeExpiredCups()
cron.schedule('0 * * * *', () => {
  purgeExpiredCups()
})

export type App = typeof app
