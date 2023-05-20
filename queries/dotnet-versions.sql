SELECT
  dependencies_dotnet_version,
  SUM(count) AS count
FROM (SELECT
  1 AS count,
  COALESCE(
    SUBSTRING(public.git_files.contents FROM '<TargetFramework[s]?>(.+)</TargetFramework[s]?>'),
    SUBSTRING(public.git_files.contents FROM '<TargetFrameworkVersion>(.+)</TargetFrameworkVersion>')
 ) AS dependencies_dotnet_version
  FROM public.git_files
  INNER JOIN public.repos ON public.repos.id = public.git_files.repo_id
  WHERE public.git_files.path LIKE '%csproj'
) AS t
WHERE dependencies_dotnet_version IS NOT NULL
GROUP BY dependencies_dotnet_version