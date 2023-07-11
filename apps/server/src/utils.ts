export function verifyResourceName(resourceName: string) {
  if (!resourceName.match(/^[a-zA-Z0-9]{1,64}$/))
    throw new Error(
      'Invalid resourceName only a-z, A-Z, 0-9 and length 1-64 characters are allowed'
    )
}

export function verifyEntityId(entityId: string) {
  if (
    !entityId.match(
      /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/
    )
  )
    throw new Error('Invalid entityId only uuid v4 is allowed')
}

export function convertSecretKey(authorization: string | null) {
  if (!authorization) return undefined
  const split = authorization.split(' ')
  if (split[0] != 'Basic') throw new Error('Invalid authorization type: ' + split[0])
  return split[1]
}