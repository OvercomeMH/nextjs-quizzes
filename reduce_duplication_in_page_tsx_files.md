# Reducing Duplication in Page.tsx Files

## Common Patterns Found

### 1. Page Layout Structure
Many pages share similar layout patterns:
- Header with navigation
- Main content area with container
- Loading states
- Error states
- Success messages

**Opportunity**: Create a shared layout component that handles:
- Common header structure
- Container and spacing
- Loading/error/success states
- Common navigation elements

**Specific Examples**:
- Admin header with QuizMaster logo and navigation
- Loading spinner in center of screen
- Error alert with description
- Success toast notifications

### 2. Data Fetching
Most pages have similar data fetching patterns:
- Loading state management
- Error handling
- Response validation
- Data transformation

**Opportunity**: Create a custom hook like `useDataFetching` that handles:
- Loading states
- Error states
- Response validation
- Common error messages
- Data transformation patterns

**Specific Examples**:
- Supabase query patterns
- Error handling with try/catch
- Loading state management
- Data state updates

### 3. Form Handling
Multiple pages handle forms with similar patterns:
- Form state management
- Validation
- Submission handling
- Success/error messages

**Opportunity**: Create a custom hook like `useForm` that handles:
- Form state management
- Common validation patterns
- Submission handling
- Success/error message display

**Specific Examples**:
- Quiz creation form
- Question editing form
- User profile form
- Settings form

### 4. Navigation
Many pages share navigation patterns:
- Back buttons
- Next/Previous navigation
- Tab navigation
- Breadcrumbs

**Opportunity**: Create shared navigation components:
- `BackButton` component
- `TabNavigation` component
- `Breadcrumbs` component

**Specific Examples**:
- Admin navigation bar
- Quiz navigation (next/previous)
- Tab navigation in analytics
- Breadcrumb navigation in nested pages

### 5. Card Layouts
Many pages use similar card layouts:
- Header with title and description
- Content area
- Footer with actions

**Opportunity**: Create specialized card components:
- `PageCard` for main content
- `StatCard` for statistics
- `FormCard` for forms

**Specific Examples**:
- Quiz list cards
- Statistics cards in dashboard
- Question cards in quiz view
- User profile cards

### 6. Table Patterns
Several pages use tables with similar patterns:
- Header row
- Data rows
- Actions column
- Sorting/filtering

**Opportunity**: Create a reusable table component:
- `DataTable` component with common features
- Shared sorting/filtering logic
- Common action buttons

**Specific Examples**:
- Quiz list table
- User list table
- Submission history table
- Activity log table

### 7. State Management
Many pages manage similar state patterns:
- Loading states
- Error states
- Success states
- Form states

**Opportunity**: Create shared state management hooks:
- `useLoadingState`
- `useErrorState`
- `useSuccessState`

**Specific Examples**:
- Quiz loading state
- Form submission state
- Delete confirmation state
- Error message state

### 8. API Integration
Pages share similar API integration patterns:
- API endpoint construction
- Response handling
- Error handling
- Data transformation

**Opportunity**: Create API utility functions:
- `api.get` and `api.post` wrappers
- Common response transformers
- Error handlers

**Specific Examples**:
- Supabase query patterns
- API endpoint construction
- Response error handling
- Data transformation

### 9. Authentication
Many pages handle authentication similarly:
- User context usage
- Protected route logic
- Role-based access

**Opportunity**: Create authentication utilities:
- `useAuth` hook improvements
- Protected route wrapper
- Role-based component wrapper

**Specific Examples**:
- Admin route protection
- User authentication checks
- Role-based access control
- Auth state management

### 10. UI Components
Pages share similar UI patterns:
- Button styles
- Form inputs
- Alerts/notifications
- Loading spinners

**Opportunity**: Create a comprehensive UI component library:
- Consistent button variants
- Form input components
- Alert/notification components
- Loading indicators

**Specific Examples**:
- Action buttons (Edit, Delete, View)
- Form inputs (Text, Select, Radio)
- Alert messages
- Loading spinners

### 11. Date Formatting
Many pages format dates consistently:
- Creation dates
- Update dates
- Submission dates

**Opportunity**: Create a date formatting utility:
- `formatDate` function
- `formatDateTime` function
- `formatTimeAgo` function

**Specific Examples**:
- Quiz creation date
- User join date
- Submission timestamp
- Last update time

### 12. Delete Operations
Several pages handle delete operations similarly:
- Confirmation dialog
- Loading state
- Error handling
- Success feedback

**Opportunity**: Create a delete operation hook:
- `useDelete` hook
- Confirmation dialog component
- Success/error handling

**Specific Examples**:
- Quiz deletion
- Question deletion
- User deletion
- Submission deletion

### 13. Search and Filtering
Many pages implement search and filtering:
- Search input field
- Filter state management
- Filter logic
- Results display

**Opportunity**: Create a search and filter hook:
- `useSearch` hook
- `useFilter` hook
- Search input component
- Filter component

**Specific Examples**:
- User search by name/email
- Quiz search by title
- Activity filtering by date
- Submission filtering by status

### 14. List Management
Several pages manage lists of items:
- List state
- Item selection
- Bulk actions
- Pagination

**Opportunity**: Create list management components:
- `DataList` component
- `SelectableList` component
- `Pagination` component
- `BulkActions` component

**Specific Examples**:
- User list management
- Quiz list management
- Question list management
- Submission list management

### 15. Admin Layout
Admin pages share common layout patterns:
- Admin header
- Navigation sidebar
- Content area
- Action buttons

**Opportunity**: Create admin layout components:
- `AdminLayout` component
- `AdminHeader` component
- `AdminSidebar` component
- `AdminContent` component

**Specific Examples**:
- Admin dashboard layout
- Quiz management layout
- User management layout
- Analytics layout

### 16. Data Display
Pages share common data display patterns:
- Data cards
- Statistics display
- Progress indicators
- Status badges

**Opportunity**: Create data display components:
- `DataCard` component
- `StatDisplay` component
- `ProgressBar` component
- `StatusBadge` component

**Specific Examples**:
- User statistics display
- Quiz progress indicators
- Submission status badges
- Activity metrics display

### 17. Action Buttons
Pages share common action button patterns:
- Primary actions
- Secondary actions
- Destructive actions
- Icon buttons

**Opportunity**: Create action button components:
- `ActionButton` component
- `IconButton` component
- `DangerButton` component
- `ButtonGroup` component

**Specific Examples**:
- Edit/Delete buttons
- View/Details buttons
- Submit/Cancel buttons
- Navigation buttons

### 18. Form Layouts
Pages share common form layout patterns:
- Form sections
- Input groups
- Label placement
- Error display

**Opportunity**: Create form layout components:
- `FormSection` component
- `InputGroup` component
- `FormLabel` component
- `FormError` component

**Specific Examples**:
- User profile form
- Quiz creation form
- Settings form
- Search form

### 19. Settings Management
Pages handle settings with similar patterns:
- Settings state
- Settings updates
- Success/error messages
- Settings persistence

**Opportunity**: Create settings management components:
- `SettingsForm` component
- `SettingsToggle` component
- `SettingsSection` component
- `useSettings` hook

**Specific Examples**:
- User profile settings
- Quiz settings
- Notification settings
- Privacy settings

### 20. Form State Management
Pages manage form state similarly:
- Input state
- Validation state
- Submission state
- Error state

**Opportunity**: Create form state management hooks:
- `useFormState` hook
- `useFormValidation` hook
- `useFormSubmission` hook
- `useFormErrors` hook

**Specific Examples**:
- Quiz creation form
- Question editing form
- Profile form
- Settings form

### 21. Success/Error Feedback
Pages handle success/error feedback similarly:
- Success messages
- Error messages
- Message timing
- Message display

**Opportunity**: Create feedback components:
- `SuccessMessage` component
- `ErrorMessage` component
- `useFeedback` hook
- `FeedbackProvider` component

**Specific Examples**:
- Settings update feedback
- Form submission feedback
- Action completion feedback
- Error display feedback

### 22. Data Synchronization
Pages handle data synchronization similarly:
- Local state updates
- Server state updates
- Optimistic updates
- Error rollback

**Opportunity**: Create data sync utilities:
- `useDataSync` hook
- `useOptimisticUpdate` hook
- `useServerSync` hook
- `SyncProvider` component

**Specific Examples**:
- Profile data sync
- Quiz data sync
- Settings sync
- Form data sync

### 23. Protected Content
Pages handle protected content similarly:
- Auth checks
- Loading states
- Error states
- Redirect logic

**Opportunity**: Create protected content components:
- `ProtectedContent` component
- `AuthGuard` component
- `useAuthGuard` hook
- `AuthProvider` improvements

**Specific Examples**:
- Protected profile page
- Protected admin pages
- Protected quiz pages
- Protected settings pages

### 24. Tab Navigation
Pages use tab navigation similarly:
- Tab state
- Tab content
- Tab transitions
- Tab persistence

**Opportunity**: Create tab navigation components:
- `TabNavigation` component
- `TabContent` component
- `useTabs` hook
- `TabProvider` component

**Specific Examples**:
- Profile tabs
- Quiz tabs
- Settings tabs
- Analytics tabs

### 25. Grid Layouts
Pages use grid layouts similarly:
- Responsive grid
- Grid items
- Grid spacing
- Grid breakpoints

**Opportunity**: Create grid layout components:
- `Grid` component
- `GridItem` component
- `useGrid` hook
- `GridProvider` component

**Specific Examples**:
- Quiz card grid
- User list grid
- Question grid
- Statistics grid

### 26. Loading States
Pages handle loading states similarly:
- Loading indicators
- Loading messages
- Loading transitions
- Loading placeholders

**Opportunity**: Create loading components:
- `LoadingSpinner` component
- `LoadingMessage` component
- `LoadingPlaceholder` component
- `useLoading` hook

**Specific Examples**:
- Quiz loading state
- Profile loading state
- Data loading state
- Form loading state

### 27. Empty States
Pages handle empty states similarly:
- Empty messages
- Empty actions
- Empty illustrations
- Empty transitions

**Opportunity**: Create empty state components:
- `EmptyState` component
- `EmptyMessage` component
- `EmptyAction` component
- `useEmptyState` hook

**Specific Examples**:
- No quizzes found
- No users found
- No submissions found
- No results found

### 28. Badge Display
Pages use badges similarly:
- Status badges
- Count badges
- Category badges
- Badge styling

**Opportunity**: Create badge components:
- `StatusBadge` component
- `CountBadge` component
- `CategoryBadge` component
- `BadgeGroup` component

**Specific Examples**:
- Quiz difficulty badge
- Question count badge
- Rating badge
- Status indicator badge

### 29. Navigation Actions
Pages handle navigation actions similarly:
- Back buttons
- Next buttons
- Action buttons
- Link buttons

**Opportunity**: Create navigation components:
- `BackButton` component
- `NextButton` component
- `ActionButton` component
- `LinkButton` component

**Specific Examples**:
- Dashboard navigation
- Profile navigation
- Quiz navigation
- Settings navigation

### 30. Responsive Design
Pages handle responsive design similarly:
- Mobile layouts
- Tablet layouts
- Desktop layouts
- Layout transitions

**Opportunity**: Create responsive components:
- `ResponsiveContainer` component
- `ResponsiveGrid` component
- `ResponsiveStack` component
- `useResponsive` hook

**Specific Examples**:
- Responsive quiz grid
- Responsive navigation
- Responsive forms
- Responsive tables

### 31. Data Aggregation
Pages handle data aggregation similarly:
- Multiple data sources
- Data joining
- Data transformation
- Data presentation

**Opportunity**: Create data aggregation utilities:
- `useDataAggregation` hook
- `DataAggregator` component
- `DataTransformer` utility
- `DataPresenter` component

**Specific Examples**:
- Dashboard data aggregation
- Analytics data aggregation
- User statistics aggregation
- Quiz results aggregation

### 32. Progress Tracking
Pages handle progress tracking similarly:
- Progress bars
- Completion status
- Achievement tracking
- Score display

**Opportunity**: Create progress tracking components:
- `ProgressBar` component
- `CompletionStatus` component
- `AchievementTracker` component
- `ScoreDisplay` component

**Specific Examples**:
- Quiz completion progress
- User achievement progress
- Learning path progress
- Course completion status

### 33. Recent Activity
Pages display recent activity similarly:
- Activity list
- Activity filters
- Activity details
- Activity timestamps

**Opportunity**: Create activity components:
- `ActivityList` component
- `ActivityFilter` component
- `ActivityDetails` component
- `ActivityTimestamp` component

**Specific Examples**:
- Recent quiz submissions
- Recent user activity
- Recent achievements
- Recent updates

### 34. Pagination
Pages handle pagination similarly:
- Page state
- Page size
- Total pages
- Navigation controls

**Opportunity**: Create pagination components:
- `Pagination` component
- `usePagination` hook
- `PaginationControls` component
- `PaginationInfo` component

**Specific Examples**:
- Activity list pagination
- User list pagination
- Quiz list pagination
- Results pagination

### 35. Date Filtering
Pages handle date filtering similarly:
- Date range selection
- Date formatting
- Date validation
- Date display

**Opportunity**: Create date filtering components:
- `DateRangePicker` component
- `DateFilter` component
- `useDateRange` hook
- `DateDisplay` component

**Specific Examples**:
- Activity date filtering
- Submission date filtering
- Report date range
- Analytics time range

### 36. Filter Management
Pages manage filters similarly:
- Filter state
- Filter combinations
- Filter persistence
- Filter reset

**Opportunity**: Create filter management components:
- `FilterManager` component
- `useFilters` hook
- `FilterGroup` component
- `FilterReset` component

**Specific Examples**:
- Activity type filters
- User role filters
- Quiz difficulty filters
- Status filters

### 37. Results Display
Pages display results similarly:
- Score presentation
- Correct/incorrect indicators
- Progress visualization
- Feedback messages

**Opportunity**: Create results display components:
- `ResultsCard` component
- `ScoreDisplay` component
- `AnswerIndicator` component
- `FeedbackMessage` component

**Specific Examples**:
- Quiz results display
- Assessment feedback
- Test scores
- Performance metrics

### 38. Scoring Logic
Pages handle scoring similarly:
- Score calculation
- Percentage computation
- Grade determination
- Performance levels

**Opportunity**: Create scoring utilities:
- `useScoring` hook
- `ScoreCalculator` utility
- `GradeAssigner` utility
- `PerformanceEvaluator` utility

**Specific Examples**:
- Quiz scoring
- Assessment grading
- Performance rating
- Achievement levels

### 39. URL Parameter Handling
Pages handle URL parameters similarly:
- Parameter extraction
- Parameter validation
- Parameter decoding
- Parameter state sync

**Opportunity**: Create URL parameter utilities:
- `useUrlParams` hook
- `ParamValidator` utility
- `ParamDecoder` utility
- `ParamSync` utility

**Specific Examples**:
- Quiz results parameters
- Search parameters
- Filter parameters
- Navigation state

### 40. Form State Management
Pages manage form state similarly:
- Input state
- Validation state
- Submission state
- Error state

**Opportunity**: Create form state management hooks:
- `useFormState` hook
- `useFormValidation` hook
- `useFormSubmission` hook
- `useFormErrors` hook

**Specific Examples**:
- Quiz creation form
- Question editing form
- Profile form
- Settings form

### 41. Multi-Step Forms
Pages handle multi-step forms similarly:
- Step navigation
- Step validation
- Step persistence
- Step completion

**Opportunity**: Create multi-step form components:
- `MultiStepForm` component
- `FormStep` component
- `StepNavigation` component
- `useFormSteps` hook

**Specific Examples**:
- Quiz creation wizard
- User registration flow
- Setup wizard
- Configuration flow

### 42. Dynamic Form Fields
Pages handle dynamic form fields similarly:
- Field addition
- Field removal
- Field validation
- Field state

**Opportunity**: Create dynamic field components:
- `DynamicFieldArray` component
- `AddRemoveField` component
- `useDynamicFields` hook
- `FieldArrayContext` provider

**Specific Examples**:
- Quiz questions management
- Option list management
- Tag management
- Dynamic settings

### 43. Data Editing
Pages handle data editing similarly:
- Initial data loading
- Form initialization
- Change tracking
- Save operations

**Opportunity**: Create data editing utilities:
- `useDataEditor` hook
- `EditForm` component
- `ChangeTracker` utility
- `SaveHandler` utility

**Specific Examples**:
- Quiz editing
- Profile editing
- Settings editing
- Content management

### 44. Form Initialization
Pages handle form initialization similarly:
- Default values
- Data population
- Field mapping
- State initialization

**Opportunity**: Create form initialization utilities:
- `useFormInitializer` hook
- `FormPopulator` utility
- `FieldMapper` utility
- `StateInitializer` utility

**Specific Examples**:
- Quiz form initialization
- Profile form population
- Settings form setup
- Edit form loading

### 45. Data Relationships
Pages handle data relationships similarly:
- Parent-child data
- Related records
- Data dependencies
- Nested structures

**Opportunity**: Create relationship handling utilities:
- `useRelatedData` hook
- `RelationshipManager` utility
- `DependencyTracker` utility
- `NestedDataHandler` utility

**Specific Examples**:
- Quiz questions relationship
- User submissions relationship
- Activity logs relationship
- Settings dependencies

### 46. Data Visualization
Pages handle data visualization similarly:
- Chart components
- Data formatting
- Responsive sizing
- Interaction handling

**Opportunity**: Create visualization components:
- `ChartWrapper` component
- `ResponsiveChart` component
- `ChartTooltip` component
- `useChartData` hook

**Specific Examples**:
- Score distribution charts
- Time series charts
- Performance graphs
- Statistical visualizations

### 47. Analytics Data
Pages handle analytics data similarly:
- Data aggregation
- Metric calculation
- Time-based analysis
- Statistical processing

**Opportunity**: Create analytics utilities:
- `useAnalytics` hook
- `DataAggregator` utility
- `MetricCalculator` utility
- `TimeSeriesAnalyzer` utility

**Specific Examples**:
- Quiz performance analytics
- User activity analysis
- Submission statistics
- Trend analysis

### 48. Chart Components
Pages use chart components similarly:
- Bar charts
- Line charts
- Pie charts
- Scatter plots

**Opportunity**: Create chart components:
- `BarChartComponent` component
- `LineChartComponent` component
- `PieChartComponent` component
- `ScatterPlotComponent` component

**Specific Examples**:
- Score distribution bars
- Submission trends lines
- Completion time scatter
- Performance pie charts

## Next Steps

1. Create shared layout components
2. Implement custom hooks for common patterns
3. Build reusable UI components
4. Develop API utilities
5. Create authentication utilities
6. Build shared navigation components
7. Implement reusable table components
8. Create form handling utilities
9. Develop state management hooks
10. Build card layout components
11. Create date formatting utilities
12. Implement delete operation hooks
13. Implement search and filtering components
14. Create list management components
15. Build admin layout components
16. Develop data display components
17. Create action button components
18. Build form layout components
19. Implement settings management components
20. Create form state management hooks
21. Build feedback components
22. Develop data sync utilities
23. Create protected content components
24. Build tab navigation components
25. Implement grid layout components
26. Create loading state components
27. Build empty state components
28. Develop badge components
29. Create navigation components
30. Build responsive components
31. Create data aggregation utilities
32. Build progress tracking components
33. Implement activity components
34. Create pagination components
35. Build date filtering components
36. Implement filter management components
37. Create results display components
38. Build scoring utilities
39. Implement URL parameter utilities
40. Create form state management hooks
41. Build multi-step form components
42. Implement dynamic field components
43. Create data editing utilities
44. Build form initialization utilities
45. Implement relationship handling utilities
46. Create data visualization components
47. Build analytics utilities
48. Implement chart components

## Benefits

- Reduced code duplication
- Consistent user experience
- Easier maintenance
- Faster development
- Better type safety
- Improved testing
- Simplified updates
- Better code organization
- Enhanced reusability
- Streamlined development process
- More consistent UI patterns
- Better user experience
- Easier component reuse
- Faster feature development
- Improved accessibility
- Better mobile responsiveness
- More consistent user feedback
- Better state management
- Improved data synchronization
- Enhanced security
- Faster development
- Easier testing
- Better error handling
- Improved performance
- Better code organization
- Better responsive design
- More consistent loading states
- Improved empty states
- Better badge management
- Enhanced navigation
- Better mobile experience
- Faster development
- Easier maintenance
- Better user experience
- Improved accessibility
- Better data organization
- Improved progress tracking
- Enhanced activity monitoring
- More consistent data display
- Better pagination handling
- Improved date filtering
- Enhanced filter management
- More consistent user interactions
- Better results presentation
- Improved scoring consistency
- Enhanced URL handling
- More reliable state management
- Better form management
- Improved multi-step flows
- Enhanced dynamic fields
- More consistent form behavior
- Better data editing flows
- Improved form initialization
- Enhanced data relationships
- More consistent editing experience
- Better data visualization
- Improved analytics handling
- Enhanced chart components
- More consistent data presentation 