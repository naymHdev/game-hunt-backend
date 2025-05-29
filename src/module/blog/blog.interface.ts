export interface Rewards {
  code: string;
  reward: string;
  validity: string;
}
export interface BlogInterface {
  title: string;
  description: string;
  author: string;
  blogImage: string;
  altTag: string
  rewards: Rewards[]
  published: boolean
  updatedAt: Date;
  isDeleted: boolean;
}

export interface IBlogUpdate {
  blogId: string;
  title?: string;
  description?: string;
  author?: string;
  blogImage?: string;
  altTag: string
  rewards?: Rewards[]
  published: boolean
  updatedAt: Date;
}
