import type { ComputedRef } from "vue";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import type { AppRouteNames } from "src/router/routes";
import { api, pageToOffset } from "src/services";
import type { Article } from "src/services/api";
import useAsync from "src/utils/use-async";

// --- 类型定义区 ---

// 定义 ArticlesType 字符串字面量类型，规定文章列表只能是这五种类型之一。
export type ArticlesType =
  | "global-feed"
  | "my-feed"
  | "tag-feed"
  | "user-feed"
  | "user-favorites-feed";

// --- 常量与工具函数区 ---

// 创建一个包含所有 ArticlesType 的数组，方便后面使用。
export const articlesTypes: ArticlesType[] = [
  "global-feed",
  "my-feed",
  "tag-feed",
  "user-feed",
  "user-favorites-feed",
];

// 创建一个 TypeScript 的 "类型守卫" 函数。
// 检查一个未知的变量 type，是不是 ArticlesType 中的一种。
export const isArticlesType = (type: unknown): type is ArticlesType =>
  articlesTypes.includes(type as ArticlesType);

// 创建一个“映射表”或“字典”。
// 它的键 (key) 是路由的名称 (比如 'global-feed', 'tag')，
// 它的值 (value) 是我们定义的文章列表类型 (比如 'global-feed', 'tag-feed')。
const routeNameToArticlesType: Partial<Record<AppRouteNames, ArticlesType>> = {
  "global-feed": "global-feed",
  "my-feed": "my-feed",
  "profile-favorites": "user-favorites-feed",
  tag: "tag-feed",
  profile: "user-feed",
};

// 定义 useArticlesMeta 函数返回值的类型，让代码更清晰。
interface UseArticlesMetaReturn {
  tag: ComputedRef<string>;
  username: ComputedRef<string>;
  articlesType: ComputedRef<ArticlesType>;
  metaChanged: ComputedRef<string>;
}

// 把路由信息 (route) 翻译成业务指令 (articlesType, tag, username)
function useArticlesMeta(): UseArticlesMetaReturn {
  // 调用 useRoute()，拿到一个响应式的 route 对象。
  // 当 URL 变化时，这个 route 对象里的信息会自动更新。
  const route = useRoute();

  // 创建三个 ref 变量，作为我们存放情报的“小本本”。
  const tag = ref("");
  const username = ref("");
  const articlesType = ref<ArticlesType>("global-feed"); // 默认是全局文章

  // --- 设置三个“侦察兵”(watch) ---

  // 侦察兵1：监视“路由名称”的变化。
  watch(
    () => route.name, // 第一个参数：告诉 watch 要监视谁。这里是 route.name

    // 第二个参数：一旦 route.name 变了，就执行这个回调函数。
    (routeName) => {
      // 根据新的路由名称，去我们的“映射表”里查一下，应该对应哪种文章类型。
      const possibleArticlesType =
        routeNameToArticlesType[routeName as AppRouteNames];

      // 如果在映射表里查不到（比如用户访问了一个无关页面），就直接返回，啥也不做。
      if (!isArticlesType(possibleArticlesType)) {
        return;
      }

      // 如果查到了，就把我们“小本本”里的 articlesType 更新成新的类型。
      articlesType.value = possibleArticlesType;
    },
    // 第三个参数：配置项。immediate: true 意味着这个 watch 在刚创建时就立即执行一次。
    { immediate: true }
  );

  // 侦察兵2：监视 URL 中“:username”参数的变化
  watch(
    () => route.params.username, // 监视 route.params 里的 username
    // 一旦 username 变了，就执行这个回调函数。
    (usernameParam) => {
      // 如果新参数和我们“小本本”里的不一样...
      if (usernameParam !== username.value)
        // 就更新“小本本”，确保它是个字符串。
        username.value = typeof usernameParam === "string" ? usernameParam : "";
    },
    { immediate: true } // 同样，立即执行一次，保证初始数据正确。
  );

  // 侦察兵3：监视 URL 中“:tag”参数的变化。
  // 逻辑和监视 username 完全一样。
  watch(
    () => route.params.tag,
    (tagParam) => {
      if (tagParam !== tag.value)
        tag.value = typeof tagParam === "string" ? tagParam : "";
    },
    { immediate: true }
  );

  // --- 任务完成，返回情报 ---
  return {
    // 把内部的 ref 变量包装成 computed 返回。
    // 这是一种保护措施，让外部只能读取，不能直接修改。
    tag: computed(() => tag.value),
    username: computed(() => username.value),
    articlesType: computed(() => articlesType.value),
    // 这是最关键的情报：一个“复合信号”。
    // 只要三个情报（文章类型、用户名、标签）中任何一个变了，这个信号就会变。
    // "执行官" useArticles 将会重点监视这个信号。
    metaChanged: computed(
      () => `${articlesType.value}-${username.value}-${tag.value}`
    ),
  };
}

// 根据 useArticlesMeta 的指令，管理文章的整个生命周期。
export function useArticles() {
  // 调用“情报员” useArticlesMeta 函数，拿到所有需要的情报和那个“复合信号”。
  const { articlesType, tag, username, metaChanged } = useArticlesMeta();

  // 创建三个 ref 变量，作为我们管理文章数据的“仓库”。
  const articles = ref<Article[]>([]);
  const articlesCount = ref(0);
  const page = ref(1);

  // 定义一个核心的异步函数，专门负责去后端 API 拿数据。
  async function fetchArticles(): Promise<void> {
    // 每次重新获取数据前，先把旧的文章列表清空，这样用户会看到“加载中...”。
    articles.value = [];

    // 准备一个变量，用来存放最终要执行的 API 请求。
    let responsePromise: null | Promise<{
      articles: Article[];
      articlesCount: number;
    }> = null;

    // --- 核心决策区：根据情报决定调用哪个 API ---

    // 如果情报是“我的关注”...
    if (articlesType.value === "my-feed") {
      responsePromise = api.articles
        .getArticlesFeed(pageToOffset(page.value))
        .then((res) => res.data);
    }
    // 如果情报是“标签文章”，并且标签存在...
    else if (articlesType.value === "tag-feed" && tag.value) {
      // 就准备调用“获取文章”的 API，并带上 tag 参数。
      responsePromise = api.articles
        .getArticles({ tag: tag.value, ...pageToOffset(page.value) })
        .then((res) => res.data);
    }
    // 如果情报是“用户的文章”，且用户存在
    else if (articlesType.value === "user-feed" && username.value) {
      responsePromise = api.articles
        .getArticles({ author: username.value, ...pageToOffset(page.value) })
        .then((res) => res.data);
    }
    // 如果情报是“用户的点赞文章”，且用户存在
    else if (articlesType.value === "user-favorites-feed" && username.value) {
      responsePromise = api.articles
        .getArticles({ favorited: username.value, ...pageToOffset(page.value) })
        .then((res) => res.data);
    }
    // 如果情报是“全局文章”..
    else if (articlesType.value === "global-feed") {
      // 就准备调用“获取文章”的 API，不带任何特殊参数。
      responsePromise = api.articles
        .getArticles(pageToOffset(page.value))
        .then((res) => res.data);
    }

    // 一个安全检查：如果上面的 if/else if 都没有匹配上，说明出问题了。
    if (responsePromise === null) {
      console.error(`Articles type "${articlesType.value}" not supported`);
      return;
    }

    // --- 执行 API 请求并更新“仓库” ---
    // 使用 await 等待我们准备好的 API 请求完成。
    const response = await responsePromise;
    // 用从后端拿到的新数据，更新我们“仓库”里的文章列表。
    articles.value = response.articles;
    // 更新文章总数。
    articlesCount.value = response.articlesCount;
  }

  // 修改页码函数
  const changePage = (value: number): void => {
    page.value = value;
  };

  // 定义一个函数，在不刷新的情况下，更新列表里某一篇特定的文章（比如点赞后）。
  const updateArticle = (index: number, article: Article): void => {
    articles.value[index] = article;
  };

  // --- 设置自动化流程 ---

  // 使用 useAsync 这个工具来包装我们的 fetchArticles 函数。
  // 它会返回一个 active 状态（我们把它重命名为 articlesDownloading），
  // 和一个新的、被包装过的 run 函数（我们叫它 runWrappedFetchArticles）
  const { active: articlesDownloading, run: runWrappedFetchArticles } =
    useAsync(fetchArticles);

  // 自动化流程1：监视那个“复合信号” metaChanged。
  watch(metaChanged, async () => {
    // 如果信号变了（比如用户从全局文章切换到了某个标签）...
    // 我们需要重新加载文章。但要先判断一下：
    // 如果当前页码已经是第一页，那就直接调用 runWrappedFetchArticles() 重新加载。
    if (page.value === 1) await runWrappedFetchArticles();
    // 如果当前页码不是第一页（比如在第三页），那就调用 changePage(1) 把页码重置为1。
    // 重置页码后，下面的“自动化流程2”就会自动被触发。
    else changePage(1);
  });

  // 自动化流程2：监视“页码” page。
  watch(page, runWrappedFetchArticles); // 一旦页码变化，就自动调用函数去获取新一页的数据。

  // --- 任务完成，把所有数据和工具都交出去 ---
  return {
    articlesDownloading, // 是否在加载中
    articles, // 文章列表
    articlesCount, // 文章总数
    page, // 当前页码
    tag, // 当前标签
    username, // 当前用户名
    changePage, // 修改页码的方法
    updateArticle, // 更新单篇文章的方法
    fetchArticles: runWrappedFetchArticles, // 获取文章的方法
  };
}
