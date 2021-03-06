import convertToTitleCase from '../utils/utils'
import { HmppsAuthClient, User } from './hmppsAuthClient'

export interface UserDetails extends User {
  name: string
  displayName: string
}

export default class UserService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getUser(token: string): Promise<UserDetails> {
    const user = await this.hmppsAuthClient.getUser(token)
    return { ...user, displayName: convertToTitleCase(user.name as string) }
  }
}
