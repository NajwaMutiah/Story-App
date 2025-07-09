import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import StoriesPage from '../pages/stories/stories-page.js';
import AddStoryPage from '../pages/add-story/add-story-page';
import LoginPage from '../pages/auth/login-page';
import FavoritesPage from '../pages/favorites/favorites-page.js';


const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/stories': new StoriesPage(),
  '/add-story': new AddStoryPage(),
  '/login': new LoginPage(),
  '/favorites': FavoritesPage,

};

export default routes;