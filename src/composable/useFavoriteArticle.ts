import type { ComputedRef } from "vue";
import { api } from "src/services";
import type { Article } from "src/services/api";
import useAsync from "src/utils/use-async";

// 定义一个接口，作为这个 Composable 函数的“使用说明书”。
//    它规定：任何想使用我这个“点赞专家”的组件，【必须】提供三样东西：
interface useFavoriteArticleProps {
  // a. 一个类型为布尔值的【计算属性 ref】，告诉我当前文章是否已点赞
  isFavorited: ComputedRef<boolean>;
  // b. 一个类型为字符串的【计算属性 ref】，告诉我当前文章的 slug 是什么
  articleSlug: ComputedRef<string>;
  // c. 一个【回调函数】，当点赞操作成功后，我会调用它，并把最新的文章数据传给你
  onUpdate: (newArticle: Article) => void;
}

// 导出一个名为 useFavoriteArticle 的函数。
//    它接收一个符合上面接口定义的配置对象作为参数，并进行解构。
export function useFavoriteArticle({
  isFavorited,
  articleSlug,
  onUpdate,
}: useFavoriteArticleProps) {
  // 定义一个核心的异步函数 `favoriteArticle`。
  //    这个函数封装了所有“点赞/取消点赞”的业务逻辑。
  const favoriteArticle = async () => {
    // 核心决策】使用一个三元运算符，来动态地决定这次要调用哪个 API 方法。
    //     - `isFavorited.value`: 读取传入的计算属性的值，判断当前是否已点赞。
    //     - 如果为 `true` (已点赞)，那么这次操作应该是【取消点赞】，所以 `requestor`
    //       这个变量就指向 `api.articles.deleteArticleFavorite` 这个方法。
    //     - 如果为 `false` (未点赞)，那么这次操作应该是【点赞】，所以 `requestor`
    //       就指向 `api.articles.createArticleFavorite` 这个方法。
    const requestor = isFavorited.value
      ? api.articles.deleteArticleFavorite
      : api.articles.createArticleFavorite;

    // 执行 API 请求。
    //    - `requestor(articleSlug.value)`: 调用我们上一步动态选择的那个 API 方法，
    //      并把文章的 slug 作为参数传进去。
    //    - `.then((res) => res.data.article)`: API 请求成功后，从返回的响应中，
    //      只提取出我们需要的、更新后的文章对象。
    //    - `await`: 等待整个异步流程完成，并把最终的文章对象赋值给 `article` 变量。
    const article = await requestor(articleSlug.value).then(
      (res) => res.data.article
    );

    // 执行回调c。
    //     把我们刚刚从后端拿到的、最新的文章数据 `article`，
    //     通过 `onUpdate` 这个回调函数“交还”给调用者（也就是 `ArticlePreview` 组件）。
    onUpdate(article);
  };

  // 把我们刚刚写好的 `favoriteArticle` 业务逻辑函数，
  //     交给“异步任务管理器” `useAsync` 去包装。
  const { active, run } = useAsync(favoriteArticle);

  return {
    // 把 useAsync 返回的 `active` 状态，重命名为更具语义的 `favoriteProcessGoing`。
    //     它是一个布尔值 ref，表示点赞操作是否正在进行中。
    favoriteProcessGoing: active,

    // 把 useAsync 返回的 `run` 函数，重命名为 `favoriteArticle`。
    //     组件调用这个返回的 `favoriteArticle` 函数时，就会触发整个流程。
    favoriteArticle: run,
  };
}
