/*
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-08-01 21:50:26
 * @Description  : 
 */

function RemoveRelatedElement(arr: any[], id: string) {
  return arr.filter((el: any) => el.id !== id)
}