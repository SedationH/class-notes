interface Module {
  id: string
  path: string
  exports: any
  parent: Module | null
  filename: string
  loaded: boolean
  children: Array<Module>
  paths: Array<string>
}