import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import type { AuthUser } from '../api/auth';
import type { AppTabParamList } from './types';

// Import screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { BrowseTasksScreen } from '../screens/BrowseTasksScreen';
import { PostTaskScreen } from '../screens/PostTaskScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TaskDetailsScreen } from '../screens/TaskDetailsScreen';
import { WorkerProfileScreen } from '../screens/WorkerProfileScreen';
import { RatingsScreen } from '../screens/RatingsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { ManageTaskScreen } from '../screens/ManageTaskScreen';
import { TaskApplicationsScreen } from '../screens/TaskApplicationsScreen';
import { ApplicantDetailScreen } from '../screens/ApplicantDetailScreen';
import { ApplyTaskScreen } from '../screens/ApplyTaskScreen';

type Props = {
  user: AuthUser;
};

const HomeStack = createNativeStackNavigator();
const BrowseStack = createNativeStackNavigator();
const PostStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator<AppTabParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="Dashboard" component={DashboardScreen} />
      <HomeStack.Screen name="TaskDetails" component={TaskDetailsScreen} />
      <HomeStack.Screen name="WorkerProfile" component={WorkerProfileScreen} />
    </HomeStack.Navigator>
  );
}

function BrowseStackNavigator() {
  return (
    <BrowseStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <BrowseStack.Screen name="BrowseTasks" component={BrowseTasksScreen} />
      <BrowseStack.Screen name="TaskDetails" component={TaskDetailsScreen} />
      <BrowseStack.Screen name="ApplyTask" component={ApplyTaskScreen} />
    </BrowseStack.Navigator>
  );
}

function PostStackNavigator() {
  return (
    <PostStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <PostStack.Screen name="PostForm" component={PostTaskScreen} />
      <PostStack.Screen name="ManageTask" component={ManageTaskScreen} />
      <PostStack.Screen name="TaskApplications" component={TaskApplicationsScreen} />
      <PostStack.Screen name="ApplicantDetail" component={ApplicantDetailScreen} />
    </PostStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="Ratings" component={RatingsScreen} />
    </ProfileStack.Navigator>
  );
}

export function AppNavigator({ user }: Props) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'];

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Browse':
              iconName = 'search';
              break;
            case 'Post':
              iconName = 'add-circle';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'home';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Browse"
        component={BrowseStackNavigator}
        options={{
          tabBarLabel: 'Browse',
        }}
      />
      <Tab.Screen
        name="Post"
        component={PostStackNavigator}
        options={{
          tabBarLabel: 'Post',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}
