import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  AuthStack: undefined;
  AppStack: NavigatorScreenParams<AppTabParamList>;
  SplashScreen: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Browse: undefined;
  Post: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  Notifications: undefined;
  TaskDetails: { taskId: number };
  WorkerProfile: { workerId: number };
};

export type BrowseStackParamList = {
  BrowseTasks: undefined;
  TaskDetails: { taskId: number };
  ApplyTask: { taskId: number };
};

export type PostStackParamList = {
  PostForm: { mode: 'create'; resetAt?: number } | undefined;
  EditTask: { taskId: number; mode: 'edit' };
  ManageTask: { taskId: number };
  TaskApplications: { taskId: number };
  ApplicantDetail: { applicationId: number };
  CompleteTask: { taskId: number };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Ratings: undefined;
};
