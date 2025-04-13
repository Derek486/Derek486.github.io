export interface IProject {
  title: string
  description: string
  github: string
  image: string
  link?: string
  tags: any[]
}

export interface IExperience {
  date: string
  title: string
  company: string
  description: string
  stack?: ITagIcon[]
}

export interface ITagIcon {
  name: string
  class: string
  icon: (_props: Record<string, any>) => any
}
