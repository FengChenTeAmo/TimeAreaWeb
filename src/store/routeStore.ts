import { create } from 'zustand';
import { Route } from '../types/route';
import { getRoutes, addRoute as saveRoute, updateRoute as updateRouteStorage, deleteRoute as deleteRouteStorage } from '../utils/storage';
import { generateId } from '../utils/format';

interface RouteStore {
  routes: Route[];
  currentRoute: Route | null;
  loadRoutes: () => void;
  setCurrentRoute: (route: Route | null) => void;
  addRoute: (route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRoute: (routeId: string, route: Partial<Route>) => void;
  deleteRoute: (routeId: string) => void;
  toggleFavorite: (routeId: string) => void;
  setAsTemplate: (routeId: string, isTemplate: boolean) => void;
  duplicateRoute: (routeId: string) => void;
}

export const useRouteStore = create<RouteStore>((set, get) => ({
  routes: [],
  currentRoute: null,

  loadRoutes: () => {
    const routes = getRoutes();
    set({ routes });
  },

  setCurrentRoute: (route) => {
    set({ currentRoute: route });
  },

  addRoute: (routeData) => {
    const now = new Date().toISOString();
    const newRoute: Route = {
      ...routeData,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    saveRoute(newRoute);
    set(state => ({ routes: [...state.routes, newRoute] }));
  },

  updateRoute: (routeId, routeData) => {
    const routes = get().routes;
    const route = routes.find(r => r.id === routeId);
    if (route) {
      const updated: Route = {
        ...route,
        ...routeData,
        updatedAt: new Date().toISOString()
      };
      updateRouteStorage(routeId, updated);
      set(state => ({
        routes: state.routes.map(r => r.id === routeId ? updated : r),
        currentRoute: state.currentRoute?.id === routeId ? updated : state.currentRoute
      }));
    }
  },

  deleteRoute: (routeId) => {
    deleteRouteStorage(routeId);
    set(state => ({
      routes: state.routes.filter(r => r.id !== routeId),
      currentRoute: state.currentRoute?.id === routeId ? null : state.currentRoute
    }));
  },

  toggleFavorite: (routeId) => {
    const routes = get().routes;
    const route = routes.find(r => r.id === routeId);
    if (route) {
      const updated: Route = {
        ...route,
        isFavorite: !route.isFavorite,
        updatedAt: new Date().toISOString()
      };
      updateRouteStorage(routeId, updated);
      set(state => ({
        routes: state.routes.map(r => r.id === routeId ? updated : r),
        currentRoute: state.currentRoute?.id === routeId ? updated : state.currentRoute
      }));
    }
  },

  setAsTemplate: (routeId, isTemplate) => {
    const routes = get().routes;
    const route = routes.find(r => r.id === routeId);
    if (route) {
      const updated: Route = {
        ...route,
        isTemplate,
        updatedAt: new Date().toISOString()
      };
      updateRouteStorage(routeId, updated);
      set(state => ({
        routes: state.routes.map(r => r.id === routeId ? updated : r),
        currentRoute: state.currentRoute?.id === routeId ? updated : state.currentRoute
      }));
    }
  },

  duplicateRoute: (routeId) => {
    const routes = get().routes;
    const route = routes.find(r => r.id === routeId);
    if (route) {
      const now = new Date().toISOString();
      const duplicated: Route = {
        ...route,
        id: generateId(),
        name: `${route.name} (副本)`,
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
        waypoints: route.waypoints.map(wp => ({
          ...wp,
          id: generateId()
        }))
      };
      saveRoute(duplicated);
      set(state => ({ routes: [...state.routes, duplicated] }));
    }
  }
}));
