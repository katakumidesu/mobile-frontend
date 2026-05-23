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
  TaskDetails: { taskId: number };
  WorkerProfile: { workerId: number };
};

export type BrowseStackParamList = {
  BrowseTasks: undefined;
  TaskDetails: { taskId: number };
  ApplyTask: { taskId: number };
};

export type PostStackParamList = {
  PostForm: undefined;
  ManageTask: { taskId: number };
  TaskApplications: { taskId: number };
  ApplicantDetail: { applicantId: number };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Ratings: undefined;
};
