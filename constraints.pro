% Enforces that all workspaces depend on other workspaces using `workspace:*` in devDependencies
gen_enforced_dependency(WorkspaceCwd, DependencyIdent, 'workspace:*', 'devDependencies') :-
  workspace_has_dependency(WorkspaceCwd, DependencyIdent, DependencyRange, 'devDependencies'),
  % Only consider dependency ranges that start with 'workspace:'
  atom_concat('workspace:', _, DependencyRange).

% Enforces the license in all public workspaces while removing it from private workspaces
gen_enforced_field(WorkspaceCwd, 'license', 'MIT') :-
  \+ workspace_field(WorkspaceCwd, 'private', true).
gen_enforced_field(WorkspaceCwd, 'license', null) :-
  workspace_field(WorkspaceCwd, 'private', true).

% Enforces the repository field for all public workspaces while removing it from private workspaces
gen_enforced_field(WorkspaceCwd, 'repository.type', 'git') :-
  \+ workspace_field(WorkspaceCwd, 'private', true).
gen_enforced_field(WorkspaceCwd, 'repository.url', 'https://github.com/babel/babel.git') :-
  \+ workspace_field(WorkspaceCwd, 'private', true).
gen_enforced_field(WorkspaceCwd, 'repository.directory', WorkspaceCwd) :-
  \+ workspace_field(WorkspaceCwd, 'private', true).
gen_enforced_field(WorkspaceCwd, 'repository', null) :-
  workspace_field(WorkspaceCwd, 'private', true).

% Enforces 'publishConfig.access' is set to public for public workspaces while removing it from private workspaces
gen_enforced_field(WorkspaceCwd, 'publishConfig.access', 'public') :-
  \+ workspace_field(WorkspaceCwd, 'private', true).
gen_enforced_field(WorkspaceCwd, 'publishConfig.access', null) :-
  workspace_field(WorkspaceCwd, 'private', true).

% Enforces the engines.node field for all workspaces except '@babel/eslint*'
gen_enforced_field(WorkspaceCwd, 'engines.node', '>=6.9.0') :-
  \+ workspace_field(WorkspaceCwd, 'private', true),
  % Get the workspace name
  workspace_ident(WorkspaceCwd, WorkspaceIdent),
  % Exempt from the rule as it supports '>=4'. TODO: remove with the next major
  WorkspaceIdent \= '@babel/plugin-proposal-unicode-property-regex',
  % Exempt from the rule as it supports '>=6.0.0'. TODO: remove with the next major
  WorkspaceIdent \= '@babel/parser',
  % Skip '@babel/eslint*' workspaces. TODO: remove with the next major
  \+ atom_concat('@babel/eslint', _, WorkspaceIdent).

% Enforces the engines.node field for '@babel/eslint*' workspaces
% TODO: remove with the next major
gen_enforced_field(WorkspaceCwd, 'engines.node', '^10.13.0 || ^12.13.0 || >=14.0.0') :-
  \+ workspace_field(WorkspaceCwd, 'private', true),
  % Get the workspace name
  workspace_ident(WorkspaceCwd, WorkspaceIdent),
  % Only target '@babel/eslint*' workspaces
  atom_concat('@babel/eslint', _, WorkspaceIdent).

% Removes the 'engines.node' field from private workspaces
gen_enforced_field(WorkspaceCwd, 'engines.node', null) :-
  workspace_field(WorkspaceCwd, 'private', true).

% Enforces the author field to be consistent
gen_enforced_field(WorkspaceCwd, 'author', 'The Babel Team (https://babel.dev/team)') :-
  \+ workspace_field(WorkspaceCwd, 'private', true).
gen_enforced_field(WorkspaceCwd, 'author', null) :-
  workspace_field(WorkspaceCwd, 'private', true).

% Enforces the main and types field to start with ./
gen_enforced_field(WorkspaceCwd, FieldName, ExpectedValue) :-
  % Fields the rule applies to
  member(FieldName, ['main', 'types']),
  % Get current value
  workspace_field(WorkspaceCwd, FieldName, CurrentValue),
  % Must not start with ./ already
  \+ atom_concat('./', _, CurrentValue),
  % Store './' + CurrentValue in ExpectedValue
  atom_concat('./', CurrentValue, ExpectedValue).

% Enforces the type field to be set
gen_enforced_field(WorkspaceCwd, 'type', 'module') :-
  \+ workspace_field(WorkspaceCwd, 'type', 'commonjs'),
  \+ workspace_field(WorkspaceCwd, 'private', true).
