export type BaseType = {
  id: string,
}

export type Profile = {
  displayName: string,
  email: string,
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT',
}

export type Teacher = Profile & {
  idNumber: string
}

export type School = {
  name: string,
  location: string,
  type: 'ELEMENTARY_SCHOOL' | 'MIDDLE_SCHOOL' | 'HIGH_SCHOOL' | 'COLLEGE' | 'TUTOR'
}

export type LoginUser = {
  email: string,
  password: string,
}

export type Schedule = {
  title: string,
  location: string,
  startTime: Date,
  endTime: Date,
  tolerance: number
}